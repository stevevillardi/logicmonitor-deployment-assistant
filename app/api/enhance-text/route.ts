import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { hasServerPermission } from '@/app/lib/auth-utils';
import { createClient } from '@/app/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
    try {
        // Get the user session server-side using your createClient
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized - Not logged in' },
                { status: 401 }
            );
        }

        // Check permissions using server-side utility
        const hasAccess = await hasServerPermission(session.user.id, {
            action: 'view',
            resource: 'pov'
        });

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Unauthorized - Insufficient permissions' },
                { status: 403 }
            );
        }

        // Continue with existing AI enhancement logic
        const { content, reason } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Enhance the following text for a Proof of Value (POV) document. The enhancement should:
                - Be concise and impactful, 2-3 sentences max.
                - Emphasize measurable success criteria
                - Highlight specific customer challenges and their solutions
                - Focus on business value and outcomes
                - Use clear, professional language
                - Maintain brevity while preserving key points
                - No marketing language or sales language
                - When asked for examples, provide a specific example that is relevant to the reason for enhancement
                
                Reason for enhancement:
                ${reason}

                Text to enhance:
                ${content}

                Provide only the enhanced text without any additional commentary.`
            }],
            temperature: 0.7,
        });

        return NextResponse.json({
            enhancedText: response.content[0].type === 'text' ? response.content[0].text : content
        });

    } catch (error) {
        console.error('Error enhancing text:', error);
        return NextResponse.json(
            { error: 'Failed to enhance text' },
            { status: 500 }
        );
    }
} 