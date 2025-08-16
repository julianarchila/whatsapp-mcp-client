import { db } from '@/server/db';
import { asc, eq, sql } from 'drizzle-orm';
import { conversation as conversationTable, message as messageTable, type Message } from '@/server/db/schema/chat';
import { randomUUID } from 'crypto';
import { ResultAsync } from 'neverthrow';
import type { ModelMessage } from 'ai';
import { ChatbotError } from '../types';

export const saveMessage = (message: ModelMessage, conversationId: string) =>
  ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      await tx.insert(messageTable).values({
        id: randomUUID(),
        content: typeof message.content === 'string' ? message.content : String(message.content),
        conversationId,
        direction: message.role === 'user' ? 'inbound' : 'outbound',
      });

      await tx.update(conversationTable)
        .set({ 
          messageCount: sql`${conversationTable.messageCount} + 1`,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(conversationTable.id, conversationId));
    }),
    (error) => new ChatbotError('MESSAGE_SAVE_FAILED', `Failed to save ${message.role} message`, error)
  ).map(() => void 0);

export const getOrCreateConversation = (userId: string) =>
  ResultAsync.fromPromise(
    (async () => {
      const now = new Date();
      const inserted = await db
        .insert(conversationTable)
        .values({ id: randomUUID(), userId, lastMessageAt: now })
        .onConflictDoNothing({ target: conversationTable.userId })
        .returning({ id: conversationTable.id });

      if (inserted.length > 0) {
        return inserted[0].id;
      }

      const existing = await db
        .select({ id: conversationTable.id })
        .from(conversationTable)
        .where(eq(conversationTable.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Conversation not found after upsert');
      }
      return existing[0].id;
    })(),
    (error) =>
      new ChatbotError(
        'CONVERSATION_CREATION_FAILED',
        'Failed to create or fetch conversation',
        error,
      ),
  );

export const loadMessages = (conversationId: string) =>
  ResultAsync.fromPromise(
    db.select().from(messageTable)
      .where(eq(messageTable.conversationId, conversationId))
      .orderBy(asc(messageTable.createdAt)),
    (error) => new ChatbotError('CONVERSATION_LOOKUP_FAILED', 'Failed to load messages', error)
  );

export const convertToModelMessages = (messages: Message[]): ModelMessage[] =>
  messages.map(i => ({
    role: i.direction === 'inbound' ? 'user' : 'assistant',
    content: i.content,
  }));


