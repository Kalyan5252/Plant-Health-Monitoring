import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const message = url.searchParams.get('message');

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a readable stream for token streaming
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3.2:3b',
              prompt: message,
              stream: true, // Enable streaming
            }),
          });

          if (!response.body) {
            throw new Error('No response body received from Ollama.');
          }

          const reader = response.body.getReader();

          let buffer = ''; // To accumulate tokens

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            buffer += chunk;

            // Process tokens as they come in
            if (chunk.includes('done')) {
              // Send the final token with [DONE] signal
              controller.enqueue(encoder.encode(`data: ${buffer}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n')); // End signal
              break;
            } else {
              // Send each token as it's received
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            }
          }
        } catch (error) {
          console.error('Error in Ollama stream:', error);
        } finally {
          controller.close();
        }
      },
    });

    // Return the readable stream as a response with proper headers
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch AI response.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
