import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { VoyageAIClient } from 'voyageai';
import { NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

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
    let queryEmbedding;
    try {
      // Preprocess the query to be more search-friendly
      const searchQuery = `${query} This text is about LogicMonitor documentation and features.`;
      
      const embeddingResponse = await voyage.embed({
        input: searchQuery,
        model: "voyage-3-lite",
      }).catch(error => {
        console.error('🔥 Voyage API Error Details:', {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack
        });
        throw error;
      });
      
      console.log('✅ Embedding received:', embeddingResponse);
      // Extract just the embedding array from the response
      queryEmbedding = embeddingResponse.data?.[0]?.embedding;
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
You are a LogicMonitor documentation assistant. Use the following documentation content and conversation history to answer the user's question.
If you can't find a relevant answer in the provided content, say so.

Previous conversation:
${conversationContext}

Documentation content:
${context}

User's question: ${query}

Please provide a clear and concise answer based on the documentation content and conversation history provided.`
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
      answer: response.content[0]?.text,
      sources: documents.map((doc: DocumentMatch) => ({
        title: doc.title,
        url: doc.url,
        similarity: doc.similarity
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