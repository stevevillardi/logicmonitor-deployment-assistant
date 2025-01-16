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

        // Get request payload
        const { notes, type } = await request.json();

        if (!notes || !type) {
            return NextResponse.json(
                { error: 'Notes and type are required' },
                { status: 400 }
            );
        }

        // Get existing items from database based on type
        let existingItems;
        if (type === 'challenges') {
            const { data } = await supabase
                .from('challenges')
                .select(`
                    id,
                    title,
                    challenge_description,
                    business_impact,
                    example,
                    challenge_categories (
                        category
                    ),
                    challenge_outcomes (
                        outcome,
                        order_index
                    )
                `)
                .limit(50);
            existingItems = data;
        } else if (type === 'decision_criteria') {
            const { data } = await supabase
                .from('decision_criteria')
                .select(`
                    id,
                    title,
                    use_case,
                    success_criteria,
                    decision_criteria_activities (
                        activity,
                        order_index
                    ),
                    decision_criteria_categories (
                        category
                    )
                `)
                .limit(50);
            existingItems = data;
        }

        // Define prompts based on type
        const prompts = {
            challenges: `Analyze the customer notes and existing challenges to recommend 3-5 monitoring challenges. 
                Use existing challenges when they closely match the customer's needs, otherwise generate new ones.
                
                Customer Notes:
                ${notes}

                Existing Challenges from our Database:
                ${JSON.stringify(existingItems, null, 2)}

                Generate a valid JSON array of challenge objects. Each object must have these exact fields:
                {
                  "id": string | null,
                  "isExisting": boolean,
                  "title": string,
                  "challenge_description": string,
                  "business_impact": string,
                  "example": string
                }

                Format Rules:
                1. Use double quotes for all keys and string values
                2. No trailing commas
                3. No comments
                4. Array must be wrapped in square brackets []
                5. Each object must be wrapped in curly braces {}
                6. Separate objects with commas
                7. No extra whitespace or newlines within objects

                Example format:
                [
                  {
                    "id": null,
                    "isExisting": false,
                    "title": "Example Title",
                    "challenge_description": "Description here",
                    "business_impact": "Impact here",
                    "example": "Example here"
                  }
                ]`,

            decision_criteria: `Analyze the customer notes and existing decision criteria to recommend 3-5 evaluation criteria. 
                Use existing criteria when they closely match the customer's needs, otherwise generate new ones.
                
                Customer Notes:
                ${notes}

                Existing Decision Criteria from our Database:
                ${JSON.stringify(existingItems, null, 2)}

                Generate a valid JSON array of criteria objects. Each object must have these exact fields:
                {
                  "id": string | null,
                  "isExisting": boolean,
                  "title": string,
                  "use_case": string,
                  "success_criteria": string,
                  "activities": string[]
                }

                Format Rules:
                1. Use double quotes for all keys and string values
                2. No trailing commas
                3. No comments
                4. Array must be wrapped in square brackets []
                5. Each object must be wrapped in curly braces {}
                6. Separate objects with commas
                7. No extra whitespace or newlines within objects

                Example format:
                [
                  {
                    "id": null,
                    "isExisting": false,
                    "title": "Example Title",
                    "use_case": "Use case here",
                    "success_criteria": "Criteria here",
                    "activities": ["Activity 1", "Activity 2"]
                  }
                ]`
        };

        // Add a JSON validation function
        const isValidJSON = (str: string): boolean => {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }
        };

        // Generate recommendations using Claude
        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: prompts[type as keyof typeof prompts]
            }],
            temperature: 0.5, // Lower temperature for more consistent formatting
        });

        let jsonString = response.content[0].type === 'text' ? response.content[0].text : '[]';

        // Clean up common JSON formatting issues
        jsonString = jsonString
            .replace(/\n/g, ' ')           // Remove newlines
            .replace(/\s+/g, ' ')          // Normalize whitespace
            .replace(/"\s+}/g, '"}')       // Remove space before closing brace
            .replace(/}\s+,/g, '},')       // Remove space after comma
            .replace(/\s+{/g, '{')         // Remove space before opening brace
            .trim();                       // Remove leading/trailing whitespace

        // Validate JSON before parsing
        if (!isValidJSON(jsonString)) {
            console.error('Invalid JSON received:', jsonString);
            return NextResponse.json(
                { error: 'Failed to generate valid recommendations' },
                { status: 500 }
            );
        }

        const recommendations = JSON.parse(jsonString);

        // Validate array is not empty
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            return NextResponse.json(
                { error: 'No recommendations generated' },
                { status: 400 }
            );
        }

        // Return the recommendations
        return NextResponse.json({
            recommendations
        });

    } catch (error) {
        console.error('Error generating POV items:', error);
        return NextResponse.json(
            { error: 'Failed to generate POV items' },
            { status: 500 }
        );
    }
} 