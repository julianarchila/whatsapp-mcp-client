import { generateAIText } from './ai/openai';
import { convertToModelMessages, getOrCreateConversation, loadMessages, saveMessage } from './history/repository';
import type { DomainMessage } from './types';
import { applyPreprocessors } from './preprocess';
import { err, ok } from 'neverthrow';
import { ChatbotError } from './types';

export const runChatbot = async (userId: string, incoming: DomainMessage) => {

  const preprocessed = await applyPreprocessors(incoming);

  const conversationIdResult = await getOrCreateConversation(userId);
  if (conversationIdResult.isErr()) return err(conversationIdResult.error);
  const conversationId = conversationIdResult.value;

  const historyResult = await loadMessages(conversationId);
  if (historyResult.isErr()) return err(historyResult.error);
  const history = convertToModelMessages(historyResult.value);

  const userContent = (preprocessed.text || '').toString();
  if (!userContent.trim()) {
    return err(new ChatbotError('INVALID_MESSAGE', 'Message content is required'));
  }

  const inboundSave = await saveMessage({ role: 'user', content: userContent }, conversationId);
  if (inboundSave.isErr()) return err(inboundSave.error);

  const responseText = await generateAIText(history, userContent);

  const outboundSave = await saveMessage({ role: 'assistant', content: responseText }, conversationId);
  void outboundSave;

  return ok(responseText);
};


