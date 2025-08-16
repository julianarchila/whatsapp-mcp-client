import { pgTable, text, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const integration = pgTable("integration", {
    id: text("id").primaryKey(),
    name: text('name').notNull().unique(),
    apiUrl: text('api_url').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

    // Authentication & Configuration
    apiKey: text('api_key'), // Encrypted API key for the tool
    iv: text('iv'), // Initialization vector for encryption
    tag: text('tag'),

    // Integration settings
    isEnabled: boolean('is_enabled').notNull().default(true),

    // Audit fields
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
});