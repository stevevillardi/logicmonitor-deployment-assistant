import { GoogleDocsService, DocumentContent } from '../../lib/googleDocs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, contents, userEmail, documentId }: { 
      title: string; 
      contents: DocumentContent[];
      userEmail: string;
      documentId?: string;
    } = await request.json();

    const docsService = new GoogleDocsService({
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!,
      project_id: process.env.GOOGLE_PROJECT_ID!,
    });

    const document = await docsService.createOrUpdateDocument(
      title, 
      contents, 
      userEmail, 
      documentId
    );

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error in docs API route:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
} 