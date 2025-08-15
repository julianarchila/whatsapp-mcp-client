import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import {
    getAllIntegrations,
    getIntegrationById,
    getIntegrationByName,
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

    // Get integration by name
    getByName: protectedProcedure
        .input(z.object({ name: z.string() }))
        .query(async ({ input, ctx }) => {
            return await getIntegrationByName(ctx.session.user.id, input.name);
        }),

    // Create new integration
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Integration name is required"),
            apiUrl: z.string().url("Valid API URL is required"),
            apiKey: z.string().optional(),
            isEnabled: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
            return await createIntegration(
                ctx.session.user.id,
                input.name,
                input.apiUrl,
                input.apiKey,
                input.isEnabled
            );
        }),

    // Update integration
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            apiUrl: z.string().url().optional(),
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