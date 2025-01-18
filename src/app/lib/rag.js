import { createClient } from 'ollama';

export async function generateResponse(query) {
  const allDocuments = getAllDocuments();

  const prompt = `Answer the user's question based on the provided documents.
  
    **Documents:**
    ${allDocuments
      .map((doc) => `**Document ${doc.id}:** ${doc.content}`)
      .join('\n\n')}
  
    **User Question:** ${query}
  
    **Response:**`;

  try {
    const client = await createClient({ model: 'ollama/gemma2:2b' });
    const response = await client.generate({ prompt });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    return 'An error occurred while generating the response.';
  }
}
