import { relations } from 'drizzle-orm';

import { user } from './auth';
import { tool } from './tool';
import { integration } from './integration';

// User relations
export const userRelations = relations(user, ({ many }) => ({
    integrations: many(integration),
    createdTools: many(tool),
}));

// Tool relations
export const toolRelations = relations(tool, ({ many, one }) => ({
    integrations: many(integration),
    createdBy: one(user, {
        fields: [tool.createdBy],
        references: [user.id],
    }),
}));

// Integration relations
export const integrationRelations = relations(integration, ({ one }) => ({
    user: one(user, {
        fields: [integration.userId],
        references: [user.id],
    }),
    tool: one(tool, {
        fields: [integration.toolId],
        references: [tool.id],
    }),
}));