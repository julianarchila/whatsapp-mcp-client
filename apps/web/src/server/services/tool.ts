import { db } from "../db";
import { tool } from "../db/schema/tool";
import { eq, like } from "drizzle-orm";
import { nanoid as generateId } from "nanoid";

export async function getAllTools() {
    return await db.select().from(tool);
}

export async function getToolById(id: string) {
    const result = await db.select().from(tool).where(eq(tool.id, id));
    return result[0] || null;
}

export async function searchTools(query: string) {
    return await db.select().from(tool).where(
        like(tool.name, `%${query}%`)
    );
}

export async function getMyTools(userId: string) {
    return await db.select().from(tool).where(eq(tool.createdBy, userId));
}

export async function createTool(name: string, apiUrl: string, description: string | undefined, createdBy: string) {
    const [createdTool] = await db
        .insert(tool)
        .values({
            id: generateId(),
            name: name,
            apiUrl: apiUrl,
            description: description,
            createdBy: createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return createdTool;
}

export async function updateTool(id: string, updateData: { name?: string, apiUrl?: string, description?: string }, userId: string) {
    // Verify ownership
    const existingTool = await db.select().from(tool).where(eq(tool.id, id));
    if (existingTool[0]?.createdBy !== userId) {
        throw new Error("Unauthorized: You can only update your own tools");
    }

    return await db
        .update(tool)
        .set({
            ...updateData,
            updatedAt: new Date(),
        })
        .where(eq(tool.id, id));
}

export async function deleteTool(id: string, userId: string) {
    // Verify ownership
    const existingTool = await db.select().from(tool).where(eq(tool.id, id));
    if (existingTool[0]?.createdBy !== userId) {
        throw new Error("Unauthorized: You can only delete your own tools");
    }

    return await db.delete(tool).where(eq(tool.id, id));
}
