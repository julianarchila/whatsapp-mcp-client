import { openai } from '@ai-sdk/openai';
import { generateText, type ModelMessage } from 'ai';

const model = openai('gpt-5-mini');

export const generateAIText = async (messages: ModelMessage[], newMessage: string) => {
  const response = await generateText({
    model,
    system: "You are threadway, a helpful whatsapp assistant",
    messages: [...messages, { role: 'user', content: newMessage }],
  });
  return response.text;
};


