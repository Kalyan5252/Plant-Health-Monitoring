import { NextRequest, NextResponse } from 'next/server';

interface PlantClassificationResult {
  result: string;
  prediction: string;
  plantName: string;
  predictedDisease: string;
  'plant image provided': boolean;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('imagefile') as File;
    const userInput = formData.get('input') as string;
    const messages = formData.get('messages') as string;

    let enhancedInput = userInput || '';

    // If messages are provided (from useChat), parse them
    if (messages) {
      const parsedMessages = JSON.parse(messages) as any[];
      if (parsedMessages.length > 0) {
        enhancedInput = parsedMessages[parsedMessages.length - 1].content;
      }
    }

    if (!enhancedInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // If image is provided, classify it first
    if (imageFile) {
      try {
        const plantFormData = new FormData();
        plantFormData.append('imagefile', imageFile);

        const response = await fetch(
          'http://134.209.149.188:8000/predict/plant_classifier',
          {
            method: 'POST',
            body: plantFormData,
          }
        );

        if (response.ok) {
          const result: PlantClassificationResult = await response.json();

          enhancedInput = `${enhancedInput}

Plant Classification Results:
- Result: ${result.result}
- Predicted Plant: ${result.prediction}
- Plant Name: ${result.plantName}
- Predicted Disease: ${result.predictedDisease}

Please provide a detailed analysis based on the plant classification results and the user's question.`;
        } else {
          enhancedInput = `${enhancedInput}

Note: Plant image analysis failed. Please provide general guidance based on the question asked.`;
        }
      } catch (error) {
        console.error('Plant classification error:', error);
        enhancedInput = `${enhancedInput}

Note: Plant image analysis failed. Please provide general guidance based on the question asked.`;
      }
    } else {
      // No image provided
      enhancedInput = `${enhancedInput}

Note: No plant image was provided by the user. Please provide general guidance based on the question asked.`;
    }

    // Forward to the regular chat API
    const chatResponse = await fetch(`${req.nextUrl.origin}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: enhancedInput }],
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Chat API failed');
    }

    // Return the streaming response from the chat API
    return new Response(chatResponse.body, {
      headers: chatResponse.headers,
    });
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
