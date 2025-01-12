import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_DEVICE_PROP_JSON!);
        const data = await response.json();
        
        // Extract and transform the systemCredentials object into an array
        const credentials = Object.entries(data.systemCredentials).map(([key, value]: [string, any]) => ({
            name: value.name,
            description: value.description,
            category: value.category
        }));

        return NextResponse.json(credentials);
    } catch (error) {
        console.error('Error fetching credentials list:', error);
        return NextResponse.json([], { status: 500 });
    }
} 