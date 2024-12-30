
import Anthropic from '@anthropic-ai/sdk';
import { VoyageAIClient } from 'voyageai';
import { NextResponse } from 'next/server';
import supabase from '../../lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY!,
});

// Types
type DocumentMatch = {
  id: string;
  url: string;
  title: string;
  content: string;
  similarity: number;
  type?: string;
};

export async function POST(request: Request) {
  // Return 404 if chat is disabled
  if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'This feature is currently unavailable' },
      { status: 404 }
    );
  }

  try {
    const { query, history } = await request.json();
    console.log('📝 Received query:', query);
    console.log('📜 Conversation history:', history);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Get embedding using Voyage AI
    console.log('🚀 Getting embedding from Voyage AI...');
    let queryEmbedding: number[] = [];

    try {
      // Preprocess the query to be more search-friendly
      const searchQuery = `${query} This text is about LogicMonitor documentation and features.`;
      
      const embeddingResponse = await voyage.embed({
        input: searchQuery,
        model: "voyage-3-lite",
      });
      
      const embedding = embeddingResponse.data?.[0]?.embedding;
      if (!embedding) throw new Error('Failed to generate embedding');
      queryEmbedding = embedding;
      console.log('✅ Embedding received:', embeddingResponse);
      console.log('📊 Embedding formatted, length:', queryEmbedding?.length);
    } catch (error) {
      console.error('❌ Voyage API call failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }

    // Query Supabase for similar documents
    console.log('🔍 Querying Supabase for similar documents...');
    console.log('🔍 Query params:', {
      embeddingLength: queryEmbedding.length,
      threshold: 0.3,
      count: 5
    });

    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5
    });

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to query documents' },
        { status: 500 }
      );
    }

    // Debug logging
    console.log('📊 Query results:', {
      totalFound: documents?.length || 0,
      topSimilarities: documents?.slice(0, 3).map((d: DocumentMatch) => ({
        similarity: d.similarity,
        title: d.title,
        urlPreview: d.url?.slice(0, 50) + '...'
      }))
    });

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant documentation to answer your question. Please try rephrasing your question or ask something else.",
        sources: []
      });
    }

    // Format context from matched documents
    const context = documents
      .map((doc: DocumentMatch) => `
Title: ${doc.title}
URL: ${doc.url}
Content: ${doc.content}
---`)
      .join('\n\n');

    // Format conversation history
    const conversationContext = history
      .map((msg: { type: string; content: string }) => 
        `${msg.type === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
      )
      .join('\n\n');

    // Generate response using Claude
    console.log('🤖 Generating response with Claude...');
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `
You are a LogicMonitor documentation assistant. Base your responses on the provided documentation and chat history content and use the following guidelines:

For API-related questions:
- Prioritize Swagger/OpenAPI documentation content
- Structure responses in this format:
  ### Endpoint Overview
  - Method: \`POST|GET|PUT|DELETE\`
  - Path: \`/api/v2/...\`
  - Description: Brief description

  ### Parameters
  #### Required Parameters
  - \`paramName\` (type): Description
  
  #### Optional Parameters
  - \`paramName\` (type): Description
    - Default: value
    - Example: value

  ### Request Example
  \`\`\`json
  {
    // Properly formatted JSON example
  }
  \`\`\`

  ### Response Example
  \`\`\`json
  {
    // Properly formatted JSON example
  }
  \`\`\`

  > **Note**: Important information or warnings

  ### Code Examples
  \`\`\`python
  # Python example if relevant
  \`\`\`

  \`\`\`powershell
  # PowerShell example if relevant
  \`\`\`

For automation questions:
- Structure PowerShell examples as:
  ### Cmdlet Usage
  \`\`\`powershell
  # Example with comments
  \`\`\`

  ### Parameters
  - \`-ParameterName\`: Description
    - Type: type
    - Required: Yes/No
    - Default: value

  ### Examples
  \`\`\`powershell
  # Practical examples from docs
  \`\`\`

  > **Tips**: Usage notes or best practices

Previous conversation:
${conversationContext}

Documentation content:
${context}

User's question: ${query}

Please provide a clear and well-formatted answer based on the documentation content and conversation history provided.`
      }],
      temperature: 0.7,
    });
    console.log('✨ Claude response received');

    // Add a raw count query
    const { data: rowCount } = await supabase
      .from('lm-pages')
      .select('id', { count: 'exact', head: true });

    console.log('📚 Total rows in database:', rowCount);

    return NextResponse.json({
      answer: response.content[0].type === 'text' ? response.content[0].text : '',
      sources: documents.map((doc: DocumentMatch) => ({
        title: doc.url,
        url: doc.title,
        similarity: doc.similarity,
        type: doc.type
      }))
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}