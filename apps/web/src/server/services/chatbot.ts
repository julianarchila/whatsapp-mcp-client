import { openai } from '@ai-sdk/openai';
import { generateText, type ModelMessage } from 'ai';
import { db } from '../db';
import { asc, eq } from 'drizzle-orm';
import { conversation as conversationTable, message as messageTable, type Message } from '../db/schema/chat';
import { randomUUID } from 'crypto';
import { Result, ok, err, ResultAsync } from 'neverthrow';

// Error types for chatbot operations
type ChatbotErrorType = 
  | 'CONVERSATION_LOOKUP_FAILED' 
  | 'CONVERSATION_CREATION_FAILED' 
  | 'MESSAGE_SAVE_FAILED' 
  | 'AI_GENERATION_FAILED' 
  | 'INVALID_USER_ID';

export class ChatbotError extends Error {
  constructor(public readonly type: ChatbotErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ChatbotError';
  }
}


const model = openai('gpt-5-mini');


export const chatbot = async (userId: string, message: string) => {
    console.log(`🤖 Processing chatbot request for user: ${userId}`);
    
    // Validate input
    if (!userId?.trim()) {
        return err(new ChatbotError('INVALID_USER_ID', 'User ID is required'));
    }
    if (!message?.trim()) {
        return err(new ChatbotError('INVALID_USER_ID', 'Message content is required'));
    }

    // Load user message history
    const chatHistoryResult = await getChatHistory(userId);
    if (chatHistoryResult.isErr()) {
        return err(chatHistoryResult.error);
    }
    
    const chatHistory = chatHistoryResult.value;
    console.log(`📚 Loaded ${chatHistory.messages.length} previous messages`);

    // Save user message
    const saveUserResult = await saveMessage({
        role: 'user',
        content: message,
    }, chatHistory.conversationId);
    
    if (saveUserResult.isErr()) {
        return err(saveUserResult.error);
    }

    // Generate AI response
    const aiResult = await generateAIResponse(chatHistory.messages, message);
    if (aiResult.isErr()) {
        return err(aiResult.error);
    }

    const responseText = aiResult.value;

    // Save assistant message
    const saveAssistantResult = await saveMessage({
        role: 'assistant',
        content: responseText,
    }, chatHistory.conversationId);
    
    if (saveAssistantResult.isErr()) {
        console.error('Failed to save assistant message, but returning response anyway');
        // Don't fail the entire operation if we can't save the assistant message
    }

    console.log(`✅ Chatbot response generated successfully`);
    return ok(responseText);
};

const saveMessage = (message: ModelMessage, conversationId: string) =>
    ResultAsync.fromPromise(
        db.insert(messageTable).values({
            id: randomUUID(),
            content: message.content as string,
            conversationId,
            direction: message.role === 'user' ? 'inbound' : 'outbound',
        }),
        (error) => new ChatbotError('MESSAGE_SAVE_FAILED', `Failed to save ${message.role} message`, error)
    ).map(() => void 0); // Return void on success


const getChatHistory = async (userId: string) => {
    console.log(`📖 Loading chat history for user: ${userId}`);
    
    // Get or create conversation
    const conversationResult = await getOrCreateConversation(userId);
    if (conversationResult.isErr()) {
        return err(conversationResult.error);
    }

    const conversationId = conversationResult.value;

    // Load messages
    const messagesResult = await loadMessages(conversationId);
    if (messagesResult.isErr()) {
        return err(messagesResult.error);
    }

    const messages = messagesResult.value;

    return ok({
        conversationId,
        messages: convertToModelMessages(messages),
    });
};

const getOrCreateConversation = (userId: string) =>
    ResultAsync.fromPromise(
        db.select().from(conversationTable).where(eq(conversationTable.userId, userId)).limit(1),
        (error) => new ChatbotError('CONVERSATION_LOOKUP_FAILED', 'Failed to lookup conversation', error)
    ).andThen((conversations) => {
        if (conversations.length > 0) {
            console.log(`📁 Found existing conversation: ${conversations[0].id}`);
            return ResultAsync.fromSafePromise(Promise.resolve(conversations[0].id));
        }

        // Create new conversation
        console.log(`📁 Creating new conversation for user: ${userId}`);
        return ResultAsync.fromPromise(
            db.insert(conversationTable).values({
                id: randomUUID(),
                userId,
                lastMessageAt: new Date(),
            }).returning(),
            (error) => new ChatbotError('CONVERSATION_CREATION_FAILED', 'Failed to create conversation', error)
        ).map((result) => result[0].id);
    });

const loadMessages = (conversationId: string) =>
    ResultAsync.fromPromise(
        db.select().from(messageTable)
            .where(eq(messageTable.conversationId, conversationId))
            .orderBy(asc(messageTable.createdAt)),
        (error) => new ChatbotError('CONVERSATION_LOOKUP_FAILED', 'Failed to load messages', error)
    );

const generateAIResponse = (chatHistory: ModelMessage[], newMessage: string) =>
    ResultAsync.fromPromise(
        generateText({
            model,
            system: "You are threadway, a helpful whatsapp assistant",
            messages: [...chatHistory, {
                role: 'user',
                content: newMessage,
            }],
        }),
        (error) => new ChatbotError('AI_GENERATION_FAILED', 'Failed to generate AI response', error)
    ).map((response) => response.text);

const convertToModelMessages = (messages: Message[]): ModelMessage[] => {
    return messages.map(i => ({
        role: i.direction === 'inbound' ? 'user' : 'assistant',
        content: i.content,
    }));
};
