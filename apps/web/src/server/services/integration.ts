import { db } from "../db";
import { integration } from "../db/schema/integration";
import { eq, and, ne } from "drizzle-orm";
import { nanoid as generateId } from "nanoid";
import crypto from "crypto";
import { env } from "@env";
import { TRPCError } from "@trpc/server";

const algorithm = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM
const rawKey = env.ENCRYPTION_KEY;

if (!rawKey) throw new Error("ENCRYPTION_KEY is required");
// Derive a 32-byte key from the provided secret (compatible with any length input)
const key = crypto.createHash("sha256").update(rawKey, "utf8").digest();

const keyBuffer = /^[0-9A-Fa-f]{64}$/.test(rawKey)
    ? Buffer.from(rawKey, "hex")
    : Buffer.from(rawKey, "base64");

function encrypt(plaintext: string): { iv: string; ciphertext: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString("hex"),
        ciphertext: encrypted.toString("hex"),
        tag: tag.toString("hex"),
    };
}

function decrypt(ciphertextHex: string, ivHex: string, tagHex: string): string {
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
}

export async function getAllIntegrations(userId: string) {
    const integrations = await db
        .select()
        .from(integration)
        .where(eq(integration.userId, userId))
        .orderBy(integration.createdAt);

    return integrations.map(({ apiKey, iv, tag, ...rest }) => ({
        ...rest,
    }));
}

export async function getIntegrationById(userId: string, id: string) {
    const result = await db
        .select()
        .from(integration)
        .where(and(eq(integration.id, id), eq(integration.userId, userId)));

    if (!result[0]) return null;

    const { apiKey, iv, tag, ...rest } = result[0];
    return {
        ...rest,
    };
}

export async function getIntegrationByName(userId: string, name: string) {
    const result = await db
        .select()
        .from(integration)
        .where(and(eq(integration.name, name), eq(integration.userId, userId)));

    if (!result[0]) return null;

    const { apiKey, iv, tag, ...safeIntegration } = result[0];
    return {
        ...safeIntegration,
    };
}

export async function createIntegration(
    userId: string,
    name: string,
    apiUrl: string,
    apiKey?: string,
    isEnabled: boolean = true
) {
    const existingIntegration = await db
        .select()
        .from(integration)
        .where(and(eq(integration.name, name), eq(integration.userId, userId)))
        .limit(1);

    if (existingIntegration.length > 0) {
        throw new TRPCError({
            code: "CONFLICT",
            message: `An integration with the name "${name}" already exists`
        });
    }

    const integrationData: any = {
        id: generateId(),
        userId: userId,
        name: name,
        apiUrl: apiUrl,
        isEnabled: isEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    if (apiKey) {
        const { iv, ciphertext, tag } = encrypt(apiKey);
        integrationData.apiKey = ciphertext; // ← ciphertext, no encryptedData
        integrationData.iv = iv;
        integrationData.tag = tag;
    }

    try {
        const [created] = await db
            .insert(integration)
            .values(integrationData)
            .returning({
                id: integration.id,
                userId: integration.userId,
                name: integration.name,
                apiUrl: integration.apiUrl,
                isEnabled: integration.isEnabled,
                createdAt: integration.createdAt,
                updatedAt: integration.updatedAt,
            });

        return created;
    } catch (error: any) {
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
            throw new TRPCError({
                code: "CONFLICT",
                message: `An integration with the name "${name}" already exists`
            });
        }

        // Re-throw otros errores
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create integration. Please try again."
        });
    }
}

export async function updateIntegration(
    userId: string,
    id: string,
    updateData: {
        name?: string,
        apiUrl?: string,
        apiKey?: string,
        isEnabled?: boolean
    }
) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Integration not found" });
    }

    if (updateData.name && updateData.name !== existingIntegration[0].name) {
        const nameConflict = await db
            .select()
            .from(integration)
            .where(and(
                eq(integration.name, updateData.name),
                eq(integration.userId, userId),
                ne(integration.id, id)
            ))
            .limit(1);

        if (nameConflict.length > 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: `An integration with the name "${updateData.name}" already exists`
            });
        }
    }

    const dataToUpdate: any = {
        updatedAt: new Date(),
    };

    if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name;
    }
    if (updateData.apiUrl !== undefined) {
        dataToUpdate.apiUrl = updateData.apiUrl;
    }
    if (updateData.apiKey) {
        // ✅ CORRECCIÓN: Usar las propiedades correctas
        const { iv, ciphertext, tag } = encrypt(updateData.apiKey);
        dataToUpdate.apiKey = ciphertext; // ← ciphertext, no encryptedData
        dataToUpdate.iv = iv;
        dataToUpdate.tag = tag; // ← También necesitas guardar el tag
    }
    if (updateData.isEnabled !== undefined) {
        dataToUpdate.isEnabled = updateData.isEnabled;
    }

    try {
        const [updated] = await db
            .update(integration)
            .set(dataToUpdate)
            .where(eq(integration.id, id))
            .returning({
                id: integration.id,
                userId: integration.userId,
                name: integration.name,
                apiUrl: integration.apiUrl,
                isEnabled: integration.isEnabled,
                createdAt: integration.createdAt,
                updatedAt: integration.updatedAt,
            });

        return updated;
    } catch (error: any) {
        // ✅ MANEJO DE ERRORES DE CONSTRAINT
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
            throw new TRPCError({
                code: "CONFLICT",
                message: `An integration with the name "${updateData.name}" already exists`
            });
        }

        // Re-throw otros errores
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update integration. Please try again."
        });
    }
}

export async function toggleIntegrationEnabled(userId: string, id: string, isEnabled: boolean) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Integration not found" });
    }

    const [updated] = await db
        .update(integration)
        .set({
            isEnabled: isEnabled,
            updatedAt: new Date(),
        })
        .where(eq(integration.id, id))
        .returning({
            id: integration.id,
            userId: integration.userId,
            name: integration.name,
            apiUrl: integration.apiUrl,
            isEnabled: integration.isEnabled,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
        });

    return updated;
}

export async function deleteIntegration(userId: string, id: string) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Integration not found or unauthorized" });
    }

    return await db.delete(integration).where(eq(integration.id, id));
}

export async function getIntegrationWithDecryptedApiKey(userId: string, id: string) {
    const result = await db
        .select()
        .from(integration)
        .where(and(eq(integration.id, id), eq(integration.userId, userId)));

    if (!result[0]) return null;

    const { apiKey, iv, tag, ...rest } = result[0];

    let decryptedApiKey: string | null = null;
    if (apiKey && iv && tag) {
        try {
            decryptedApiKey = decrypt(apiKey, iv, tag);
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
        }
    }

    return {
        ...rest,
        apiKey: decryptedApiKey,
    };
}