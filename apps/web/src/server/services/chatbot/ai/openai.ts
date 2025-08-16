import { openai } from '@ai-sdk/openai';
import { generateText, type ModelMessage } from 'ai';
import {fromThrowable, fromPromise} from "neverthrow"
import { ChatbotError } from '../types';

const model = openai('gpt-5-mini');

export const generateAIText = async (messages: ModelMessage[], newMessage: string) => {
  const response = fromPromise(generateText({
    model,
    system: "You are threadway, a helpful whatsapp assistant",
    messages: [...messages, { role: 'user', content: newMessage }],
  }), (error) => new ChatbotError('AI_GENERATION_FAILED', 'Failed to generate AI text', error));

  return response;
};


