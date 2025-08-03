import { NextApiRequest, NextApiResponse } from 'next';
import { queryOllama } from '@/app/utils/ollama';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { context, query } = (await req.json()) as {
      context: string;
      query: string;
    };
    // console.log('context:', context);
    // console.log('query:', query);
    const model = 'llama3.2:3b';
    const prompt = `Context:\n${context}\n\nQuery:\n${query}`;
    const response = await queryOllama(model, prompt);
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to query Ollama' },
      { status: 500 }
    );
  }
}
