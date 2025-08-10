import { db } from "../db";
import { integration } from "../db/schema/integration";
import { eq, and } from "drizzle-orm";
import { nanoid as generateId } from "nanoid";
import crypto from "crypto";
import { env } from "@env";

const algorithm = "aes-256-cbc";
const secretKey = env.ENCRYPTION_KEY || "a-very-secret-key-of-32-bytes-dev";

function encrypt(text: string): { iv: string, encryptedData: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(encryptedData: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export async function getAllIntegrations(userId: string) {
    const integrations = await db.select().from(integration).where(eq(integration.userId, userId));
    return integrations.map(i => ({
        ...i,
        apiKey: decrypt(i.apiKey, i.iv)
    }));
}

export async function getIntegrationById(userId: string, id: string) {
    const result = await db
        .select()
        .from(integration)
        .where(and(eq(integration.id, id), eq(integration.userId, userId)));

    if (!result[0]) return null;

    return {
        ...result[0],
        apiKey: decrypt(result[0].apiKey, result[0].iv)
    };
}

export async function getIntegrationByToolId(userId: string, toolId: string) {
    const result = await db
        .select()
        .from(integration)
        .where(and(eq(integration.toolId, toolId), eq(integration.userId, userId)));

    if (!result[0]) return null;

    return {
        ...result[0],
        apiKey: decrypt(result[0].apiKey, result[0].iv)
    };
}

export async function createIntegration(userId: string, toolId: string, apiKey: string, isEnabled: boolean) {
    const { iv, encryptedData } = encrypt(apiKey);
    return await db.insert(integration).values({
        id: generateId(),
        userId: userId,
        toolId: toolId,
        apiKey: encryptedData,
        iv: iv,
        isEnabled: isEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function updateIntegration(userId: string, id: string, updateData: { apiKey?: string, isEnabled?: boolean }) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new Error("Integration not found or unauthorized");
    }

    const dataToUpdate: { apiKey?: string, isEnabled?: boolean, updatedAt: Date, iv?: string } = {
        updatedAt: new Date(),
    };

    if (updateData.apiKey) {
        const { iv, encryptedData } = encrypt(updateData.apiKey);
        dataToUpdate.apiKey = encryptedData;
        dataToUpdate.iv = iv;
    }
    if (updateData.isEnabled !== undefined) {
        dataToUpdate.isEnabled = updateData.isEnabled;
    }

    return await db
        .update(integration)
        .set(dataToUpdate)
        .where(eq(integration.id, id));
}

export async function toggleIntegrationEnabled(userId: string, id: string, isEnabled: boolean) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new Error("Integration not found or unauthorized");
    }

    return await db
        .update(integration)
        .set({
            isEnabled: isEnabled,
            updatedAt: new Date(),
        })
        .where(eq(integration.id, id));
}

export async function deleteIntegration(userId: string, id: string) {
    const existingIntegration = await db.select().from(integration).where(
        and(
            eq(integration.id, id),
            eq(integration.userId, userId)
        )
    );

    if (!existingIntegration[0]) {
        throw new Error("Integration not found or unauthorized");
    }

    return await db.delete(integration).where(eq(integration.id, id));
}
