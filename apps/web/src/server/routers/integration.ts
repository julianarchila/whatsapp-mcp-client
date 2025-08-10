import z from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import {
    getAllIntegrations,
    getIntegrationById,
    getIntegrationByToolId,
    createIntegration,
    updateIntegration,
    toggleIntegrationEnabled,
    deleteIntegration,
} from "../services/integration";

export const integrationRouter = router({
    // Get all integrations for current user
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await getAllIntegrations(ctx.session.user.id);
    }),

    // Get integration by ID (only own integrations)
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            return await getIntegrationById(ctx.session.user.id, input.id);
        }),

    // Get integration by tool ID
    getByToolId: protectedProcedure
        .input(z.object({ toolId: z.string() }))
        .query(async ({ input, ctx }) => {
            return await getIntegrationByToolId(ctx.session.user.id, input.toolId);
        }),

    // Create new integration
    create: protectedProcedure
        .input(z.object({
            toolId: z.string(),
            apiKey: z.string().min(1, "API key is required"),
            isEnabled: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
            return await createIntegration(
                ctx.session.user.id,
                input.toolId,
                input.apiKey,
                input.isEnabled
            );
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
            return await updateIntegration(ctx.session.user.id, id, updateData);
        }),

    // Toggle enabled/disabled state
    toggleEnabled: protectedProcedure
        .input(z.object({ id: z.string(), isEnabled: z.boolean() }))
        .mutation(async ({ input, ctx }) => {
            return await toggleIntegrationEnabled(
                ctx.session.user.id,
                input.id,
                input.isEnabled
            );
        }),

    // Delete integration
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return await deleteIntegration(ctx.session.user.id, input.id);
        }),
});