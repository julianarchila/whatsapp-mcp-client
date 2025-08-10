import { pgTable, text, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tool } from "./tool";

export const integration = pgTable("integration", {
    id: text("id").primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    toolId: text('tool_id').notNull().references(() => tool.id, { onDelete: 'cascade' }),

    // Authentication & Configuration
    apiKey: text('api_key').notNull(), // Encrypted API key for the tool

    // Integration settings
    isEnabled: boolean('is_enabled').notNull().default(true),
    // configuration: text('configuration'), // JSON string for tool-specific config

    // Audit fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    // Ensure one integration per user-tool combination
    userToolUnique: unique().on(table.userId, table.toolId),
}));