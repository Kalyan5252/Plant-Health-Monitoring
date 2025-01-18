import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';

export interface ConvertibleMessage {
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
    const body = (await req.json()) as RequestBody;
    console.log(body);
    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const context = '';
    const lastMessage = body.messages[body.messages.length - 1];
    const query = lastMessage.content;

    const prompt = `Query:\n${query}`;

    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
    const result = await ollama.generate({
      model: 'llama3.2:3b',
      prompt,
      stream: true,
    });

    const { readable, writable } = new TransformStream(); // Create a stream

    const writer = writable.getWriter(); // Get a writable stream
    const encoder = new TextEncoder(); // Encode text into Uint8Array

    (async () => {
      try {
        for await (const chunk of result) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(chunk.response)}\n\n`)
          );
        }
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        writer.close(); // Close the stream
      } catch (err) {
        console.error('Error during streaming:', err);
        writer.close();
      }
    })();

    console.log('Ollama Response:', result);

    // Return a readable stream as the response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
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
