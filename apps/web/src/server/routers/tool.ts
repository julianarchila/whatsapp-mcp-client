import z from "zod";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import {
    getAllTools,
    getToolById,
    searchTools,
    getMyTools,
    createTool,
    updateTool,
    deleteTool,
} from "../services/tool";

export const toolRouter = router({
    // Get all tools (public endpoint)
    getAll: publicProcedure.query(async () => {
        return await getAllTools();
    }),

    // Get tool by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return await getToolById(input.id);
        }),

    // Search tools by name
    search: publicProcedure
        .input(z.object({
            query: z.string().min(1)
        }))
        .query(async ({ input }) => {
            return await searchTools(input.query);
        }),

    // Get tools created by current user
    getMyTools: protectedProcedure.query(async ({ ctx }) => {
        return await getMyTools(ctx.session.user.id);
    }),

    // Create new tool
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            apiUrl: z.string().url("Must be a valid URL"),
            description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            return await createTool(
                input.name,
                input.apiUrl,
                input.description,
                ctx.session.user.id
            );
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
            return await updateTool(id, updateData, ctx.session.user.id);
        }),

    // Delete tool
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return await deleteTool(input.id, ctx.session.user.id);
        }),
});