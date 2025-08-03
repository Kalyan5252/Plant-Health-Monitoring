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
  context?: {
    plantClassification?: {
      result: string;
      prediction: string;
      plantName: string;
      predictedDisease: string;
    };
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    console.log('got the body to bk:', body);

    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No valid last message found');
    }

    const query = lastMessage.content;
    console.log(query);

    // Enhance the query with plant classification context if available
    let enhancedQuery = query;
    if (body.context?.plantClassification) {
      const classification = body.context.plantClassification;
      enhancedQuery = `${query}

Plant Classification Results:
- Result: ${classification.result}
- Predicted Plant: ${classification.prediction}
- Plant Name: ${classification.plantName}
- Predicted Disease: ${classification.predictedDisease}

Please provide a detailed analysis based on the plant classification results and the user's question.`;
    }

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
      system: ` Assume Your are a model who knows everything about farming and gardening..now u want to suggest cures for diseases for consumers..Summarize everything that u wanted to tell in short note.u never say that u dont know medical advices...you just need to give headings..not much detail about it..until prompt was detailing..almost complete response in 10 20 words if no detail was given..for much detail ask user to give plant image..and u r specialized in tomato, chilli, potato and brinjal plants, spell brinjal instead of eggplant..remember you should never say u cannot/can't or such negative words..
        You are an AI assistant that responds with well-structured and clearly formatted answers, just like ChatGPT. Follow these guidelines for every response:
        
        1. **Use Markdown Formatting:**
        - Use '**bold**' for key points and headings.
        - Use '_italics_' for emphasis.

        2. **Break Text into Paragraphs:**
          - Avoid long, dense paragraphs.
          - Start a new paragraph after every key idea.

        3. **Use Lists for Steps or Multiple Points:**
          - Use numbered lists ('1.', '2.') for ordered steps.
          - Use bullet points ('-') for unordered points.

        4. **Enhance Readability:**
          - Provide concise but detailed explanations.
          - Add line breaks to separate sections.

        5. **For Code Responses:**
          - If responding with code, wrap it inside triple backticks (\` \`\`\` \`).
          - Specify the language (e.g., \`\`\`javascript, \`\`\`python).

        6. **For Explanations:**
          - Provide a short summary before diving into details.
          - If applicable, give examples to clarify concepts.

        Your goal is to deliver responses that are **clean, structured, and easy to read**, similar to a professional tutorial or a ChatGPT-style conversation.

        if prompt was like user's introduction like hi/helo/hello/such that u need to tell that you are ai to assist in gardening ..
        `,
      prompt: enhancedQuery,
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
