import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const tool = pgTable("tool", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    apiUrl: text('api_url').notNull(),
    description: text('description'),

    // Audit fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdBy: text('created_by'), // User ID who created this tool (for public tools)
});