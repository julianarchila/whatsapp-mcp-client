import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const model = openai('gpt-5-mini');

const text = async (message: string) => {
    const textResponse = await generateText({
        model,
        prompt: message,
    })

    console.log('Chatbot response:', textResponse);
    return textResponse;
}

export default {
    text,
}
