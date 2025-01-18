import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';

const MONGODB_URI = process.env.MONGO_URI;
const mongoClient = new MongoClient(MONGODB_URI || '');

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query: string };
    await mongoClient.connect();
    const db = mongoClient.db('rag-db');
    const collection = db.collection<Document>('documents');
    const results = await collection
      .find({ $text: { $search: query } })
      .limit(5)
      .toArray();
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({
        message: error.message,
      });
    else return NextResponse.json({ message: 'Failed to Generate Response' });
  }
}
