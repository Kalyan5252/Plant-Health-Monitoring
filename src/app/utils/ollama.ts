import axios from 'axios';

interface OllamaResponse {
  content: string;
}

export const queryOllama = async (model: string, prompt: string) => {
  try {
    // const response = await axios.post<OllamaResponse>(
    //   'http://localhost:11434/api/generate',
    //   {
    //     model,
    //     prompt,
    //   }
    // );
    // return response.data;
    const url = 'http://localhost:11434/api/generate';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: `Please summarize the following in a concise and clean manner ..if you are giving it in buttlets format just make a keybowrd like -%bullets-% and here is the prompt: ${prompt} `,
      }),
    });

    if (!response.body) {
      throw new Error('No response body received from Ollama');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        result += decoder.decode(value, { stream: true });
      }
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error querying Ollama:', error.message || '');
    } else {
      console.error('Unknown error occurred');
    }
  }
};
