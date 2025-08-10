import z from "zod";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { tool } from "../db/schema/tool";
import { eq, like } from "drizzle-orm";
import { db } from "../db";
import { nanoid as generateId } from "nanoid";

export const toolRouter = router({
    // Get all tools (public endpoint)
    getAll: publicProcedure.query(async () => {
        return await db.select().from(tool);
    }),

    // Get tool by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const result = await db.select().from(tool).where(eq(tool.id, input.id));
            return result[0] || null;
        }),

    // Search tools by name
    search: publicProcedure
        .input(z.object({
            query: z.string().min(1)
        }))
        .query(async ({ input }) => {
            return await db.select().from(tool).where(
                like(tool.name, `%${input.query}%`)
            );
        }),

    // Get tools created by current user
    getMyTools: protectedProcedure.query(async ({ ctx }) => {
        return await db.select().from(tool).where(eq(tool.createdBy, ctx.session.user.id));
    }),

    // Create new tool
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            apiUrl: z.string().url("Must be a valid URL"),
            description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const [createdTool] = await db
                .insert(tool)
                .values({
                    id: generateId(),
                    name: input.name,
                    apiUrl: input.apiUrl,
                    description: input.description,
                    createdBy: ctx.session.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return createdTool;
        }),

    // Update tool
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            apiUrl: z.string().url().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;

            // Verify ownership
            const existingTool = await db.select().from(tool).where(eq(tool.id, id));
            if (existingTool[0]?.createdBy !== ctx.session.user.id) {
                throw new Error("Unauthorized: You can only update your own tools");
            }

            return await db
                .update(tool)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(tool.id, id));
        }),

    // Delete tool
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            // Verify ownership
            const existingTool = await db.select().from(tool).where(eq(tool.id, input.id));
            if (existingTool[0]?.createdBy !== ctx.session.user.id) {
                throw new Error("Unauthorized: You can only delete your own tools");
            }

            return await db.delete(tool).where(eq(tool.id, input.id));
        }),
});