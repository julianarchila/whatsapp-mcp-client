import { openai } from '@ai-sdk/openai';
import { generateText, type ModelMessage } from 'ai';
import { db } from '../db';
import { asc, eq } from 'drizzle-orm';
import { conversation as conversationTable, message as messageTable, type Message } from '../db/schema/chat';
import { randomUUID } from 'crypto';


const model = openai('gpt-5-mini');


export const chatbot = async (userId: string, message: string) => {
    // load user message history
    const chatHistory = await getChatHistory(userId)

    // save user message
    await saveMessage({
        role: 'user',
        content: message,
    }, chatHistory.conversationId)

    const response = await generateText({
        model,
        system: "You are threadway, a helpful whatsapp assistant",
        messages: [...chatHistory.messages, {
            role: 'user',
            content: message,
        }],
    })

    // save assistant message
    await saveMessage({
        role: 'assistant',
        content: response.text,
    }, chatHistory.conversationId)

    return response.text
}

const saveMessage = async (message: ModelMessage, conversationId: string) => {
    await db.insert(messageTable).values({
        id: randomUUID(),
        content: message.content as string,
        conversationId,
        direction: message.role === 'user' ? 'inbound' : 'outbound',

    })
}


const getChatHistory = async (userId: string): Promise<{ conversationId: string, messages: ModelMessage[] }> => {

    // get conversation first and then messages
    // conversation will be created if it doesn't exist
    let conversation = await db.select().from(conversationTable).where(eq(conversationTable.userId, userId)).limit(1)
    if (conversation.length === 0) {
        conversation = await db.insert(conversationTable).values({
            id: randomUUID(),
            userId,
            lastMessageAt: new Date(),
        }).returning()
    }

    const conversationId = conversation[0].id
    const messages = await db.select().from(messageTable)
        .where(eq(messageTable.conversationId, conversationId))
        .orderBy(asc(messageTable.createdAt))


    return {
        conversationId,
        messages: convertToModelMessages(messages),
    }
}

const convertToModelMessages = (messages: Message[]): ModelMessage[] => {
    return messages.map(i => ({
        role: i.direction === 'inbound' ? 'user' : 'assistant',
        content: i.content,
    }))
}