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
    });

    console.log('Ollama Response:', result);

    // const responseChunks = result.response.split('\n'); // Split the response into chunks (line by line)

    // const nodeRes = res as unknown as ServerResponse;
    // Set headers for streaming data using SSE
    // nodeRes.setHeader('Content-Type', 'text/event-stream');
    // nodeRes.setHeader('Cache-Control', 'no-cache');
    // nodeRes.setHeader('Connection', 'keep-alive');

    // Iterate over the response and send chunks as SSE data
    // for (const chunk of responseChunks) {
    //   if (chunk.trim()) {
    //     nodeRes.write(`data: ${chunk}\n\n`); // Send chunk as a part of SSE stream
    //   }
    // }

    // End the stream when finished
    // return nodeRes.end();

    return new Response(JSON.stringify({ content: result.response }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
