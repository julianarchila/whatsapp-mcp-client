import z from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { integration } from "../db/schema/integration";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { nanoid as generateId } from "nanoid";

export const integrationRouter = router({
    // Get all integrations for current user
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await db.select().from(integration).where(
            eq(integration.userId, ctx.session.user.id)
        );
    }),

    // Get integration by ID (only own integrations)
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const result = await db.select().from(integration).where(
                and(
                    eq(integration.id, input.id),
                    eq(integration.userId, ctx.session.user.id)
                )
            );
            return result[0] || null;
        }),

    // Get integration by tool ID
    getByToolId: protectedProcedure
        .input(z.object({ toolId: z.string() }))
        .query(async ({ input, ctx }) => {
            const result = await db.select().from(integration).where(
                and(
                    eq(integration.toolId, input.toolId),
                    eq(integration.userId, ctx.session.user.id)
                )
            );
            return result[0] || null;
        }),

    // Create new integration
    create: protectedProcedure
        .input(z.object({
            toolId: z.string(),
            apiKey: z.string().min(1, "API key is required"),
            isEnabled: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
            return await db.insert(integration).values({
                id: generateId(),
                userId: ctx.session.user.id,
                toolId: input.toolId,
                apiKey: input.apiKey,
                isEnabled: input.isEnabled,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }),

    // Update integration
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            apiKey: z.string().optional(),
            isEnabled: z.boolean().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;

            // Verify ownership
            const existingIntegration = await db.select().from(integration).where(
                and(
                    eq(integration.id, id),
                    eq(integration.userId, ctx.session.user.id)
                )
            );

            if (!existingIntegration[0]) {
                throw new Error("Integration not found or unauthorized");
            }

            return await db
                .update(integration)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(integration.id, id));
        }),

    // Toggle enabled/disabled state
    toggleEnabled: protectedProcedure
        .input(z.object({ id: z.string(), isEnabled: z.boolean() }))
        .mutation(async ({ input, ctx }) => {
            // Verify ownership
            const existingIntegration = await db.select().from(integration).where(
                and(
                    eq(integration.id, input.id),
                    eq(integration.userId, ctx.session.user.id)
                )
            );

            if (!existingIntegration[0]) {
                throw new Error("Integration not found or unauthorized");
            }

            return await db
                .update(integration)
                .set({
                    isEnabled: input.isEnabled,
                    updatedAt: new Date(),
                })
                .where(eq(integration.id, input.id));
        }),

    // Delete integration
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            // Verify ownership
            const existingIntegration = await db.select().from(integration).where(
                and(
                    eq(integration.id, input.id),
                    eq(integration.userId, ctx.session.user.id)
                )
            );

            if (!existingIntegration[0]) {
                throw new Error("Integration not found or unauthorized");
            }

            return await db.delete(integration).where(eq(integration.id, input.id));
        }),
});