import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

async function handleRequest(request: NextRequest, pathSegments: string[]) {
  try {
    const path = pathSegments.join('/');
    const company = request.headers.get('x-lm-company') || '';
    const url = `https://${company}.logicmonitor.com/santaba/rest/${path}`;

    console.log('Proxying request to:', url);

    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'X-Version': '3',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? null : await request.text(),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-lm-company',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-lm-company',
    },
  });
}

// Enable Edge Runtime
export const runtime = 'edge';