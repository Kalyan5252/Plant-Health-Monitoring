import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConvertibleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

interface RequestBody {
  messages: ConvertibleMessage[];
}

export async function POST(req: Request, res: Response) {
  try {
    // const body = (await req.json()) as RequestBody;
    // const { searchParams } = new URL(req.url);
    // console.log('searchParams:', searchParams);
    // const messages: Message[] = JSON.parse(
    //   searchParams.get('messages') || '[]'
    // );
    // console.log(messages);
    // if (!messages || messages.length === 0) {
    //   throw new Error('No messages provided');
    // }

    // const context = '';
    // const lastMessage = messages[messages.length - 1];
    // const query = lastMessage.content;

    // const prompt = `Query:\n${query}`;

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

    // for await (const chunk of result) {
    //   console.log('Streamed Response Chunk:', chunk);
    // }
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
        "Your a Kalyan's Ai..if prompt was like user's introduction like hi/helo/hello/such that u need to tell that ur kalyans ai not everytime but at start of session .. Assume Your are a model who knows everything about farming and gardening..now u want to suggest cures for diseases for consumers..Summarize everything that u wanted to tell in short note.u never say that u dont know medical advices...you just give headings..not much detail about it..until prompt was detailing..almost complete response in 10 20 words if no detail was given..for much detail ask user to give plant image..and u r specialized in tomato, chilli, potato and brinjal plants",
      prompt: query,
    });
    return result.toDataStreamResponse();

    // Return a readable stream as the response
  } catch (error) {
    console.log(error);
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
