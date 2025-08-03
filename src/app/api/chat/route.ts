import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

interface ConvertibleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

interface RequestBody {
  messages: ConvertibleMessage[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const google = createGoogleGenerativeAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: process.env.GEMINI_API_KEY,
    });

    const model = google('models/gemini-2.0-flash', {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    });

    // ✅ await this or it breaks
    const result = await streamText({
      model,
      system: `Assume you are a model who knows everything about farming and gardening.
Now you want to suggest cures for diseases for consumers. 
Summarize everything you want to tell in a short note.
You never say that you don’t know medical advice.
You just need to give headings, not much detail unless the prompt is detailed.
Almost complete response in 10–20 words if no detail was given.
For more detail, ask the user to give a plant image.
You are specialized in tomato, chilli, potato, and cucumber plants.
When you are given the plant disease you should generate care for it, precautions etc.
Remember, you should never say "I cannot" or "I don't know".
If the user says hi/hello/etc., introduce yourself as an AI to assist in gardening.`,
      messages: body.messages,
    });

    // ✅ this returns a streaming response
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Gemini error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { message: 'Failed to Generate Response' },
        { status: 500 }
      );
    }
  }
}
