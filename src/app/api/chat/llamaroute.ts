import { NextResponse } from 'next/server';
import { queryOllama } from '@/app/utils/ollama';
import { streamText } from 'ai';
import { Ollama } from 'ollama';
import { LanguageModelV1, LanguageModelV1CallOptions } from '@ai-sdk/provider';
import { IncomingMessage, ServerResponse } from 'http';

// const { LLaMA } = require('ollama');
// import { Ollama } from 'ollama';

// Define the missing type for LanguageModelV1ObjectGenerationMode
type LanguageModelV1ObjectGenerationMode =
  | 'text-generation'
  | 'stream-generation';

export interface ConvertibleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

interface RequestBody {
  messages: ConvertibleMessage[];
}

// class OllamaWrapper implements LanguageModelV1 {
//   private llm: Ollama;
//   specificationVersion: 'v1' = 'v1';
//   provider: 'meta-ai' = 'meta-ai';
//   modelId: string = 'gemma-2-2b';
//   defaultObjectGenerationMode: LanguageModelV1ObjectGenerationMode = 'text-generation';

//   constructor(llm: Ollama) {
//     this.llm = llm;
//   }

//   async doGenerate(options: LanguageModelV1CallOptions): Promise<string> {
//     const prompt = options.prompt;
//     const response = await this.llm.generate(prompt);
//     return response?.result || ''; // Adjust based on the actual response structure
//   }

//   async doStream(options: LanguageModelV1CallOptions): Promise<ReadableStream<any>> {
//     const prompt = options.prompt;
//     return this.llm.stream(prompt);
//   }
// }

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function cleanRepeatedText(input: string): string {
  // Regular expression to match repeated words with quotation marks
  const regex = /\b(\w+)\1+\b/g;

  // Replace the repeated words with just one occurrence of the word
  const cleanedText = input.replace(regex, '$1');

  // Clean extra spaces between words and trim the string
  return cleanedText.replace(/\s{2,}/g, ' ').trim();
}

function removeQuotes(text: string): string {
  // Regular expression to remove leading and trailing quotes from words
  return text.replace(/(^"|"$)/g, '');
}

// Example usage:
const exampleText = `"It" "looks" "like" "you" haven't "asked" a "question" "yet"`;
const cleanedText = exampleText.split(' ').map(removeQuotes).join(' ');

console.log(cleanedText);

export async function GET(req: Request, res: Response) {
  try {
    // const body = (await req.json()) as RequestBody;
    const { searchParams } = new URL(req.url);
    console.log('searchParams:', searchParams);
    const messages: Message[] = JSON.parse(
      searchParams.get('messages') || '[]'
    );
    console.log(messages);
    // if (!messages || messages.length === 0) {
    //   throw new Error('No messages provided');
    // }

    const context = '';
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    const prompt = `Query:\n${query}`;

    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
    const result = await ollama.generate({
      model: 'llama3.2:3b',
      prompt,
      stream: true,
    });

    // for await (const chunk of result) {
    //   console.log('Streamed Response Chunk:', chunk);
    // }

    const { readable, writable } = new TransformStream(); // Create a stream

    const writer = writable.getWriter(); // Get a writable stream
    const encoder = new TextEncoder(); // Encode text into Uint8Array

    (async () => {
      try {
        for await (const chunk of result) {
          console.log('check:', JSON.stringify(chunk.response));
          await writer.write(
            encoder.encode(
              `data: ${removeQuotes(JSON.stringify(chunk.response))}\n\n`
            )
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

    // return new Response(JSON.stringify({ content: result }), {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    // const llmWrapper = new OllamaWrapper(llm);

    // Stream the response
    // const response = streamText({
    //   model: llm,
    //   system: 'Your job is to generate the answers to the given question. Make the answer clean, clear, and structured. If no context is given, return "s0s". If no question is provided, return "s1s".',
    //   prompt,
    // });
    // return response.toDataStreamResponse();
    // const response = await model.generate(prompt);
    // return NextResponse.json({ response });
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
