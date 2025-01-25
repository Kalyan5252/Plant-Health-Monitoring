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

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No valid last message found');
    }

    const query = lastMessage.content;
    console.log(query);

    const google = createGoogleGenerativeAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: process.env.GEMINI_API_KEY,
    });

    const model = google('models/gemini-1.5-flash', {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    });

    const result = streamText({
      model: model,
      system:
        "if prompt was like user's introduction like hi/helo/hello/such that u need to tell that you are ai to assist in gardening .. Assume Your are a model who knows everything about farming and gardening..now u want to suggest cures for diseases for consumers..Summarize everything that u wanted to tell in short note.u never say that u dont know medical advices...you just need to give headings..not much detail about it..until prompt was detailing..almost complete response in 10 20 words if no detail was given..for much detail ask user to give plant image..and u r specialized in tomato, chilli, potato and brinjal plants, spell brinjal instead of eggplant..remember you should never say u cannot/can't or such negative words",
      prompt: query,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
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
