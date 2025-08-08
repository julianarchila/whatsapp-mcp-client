import { cerebras } from '@ai-sdk/cerebras';
import { generateText } from 'ai';

export async function POST(req: Request) {

    const result = await generateText({
        model: cerebras('llama-3.3-70b'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });

    return new Response(JSON.stringify(result), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        status: 200,
    });
}
