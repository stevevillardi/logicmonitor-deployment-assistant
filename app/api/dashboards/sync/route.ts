import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST() {
  try {
    // Fetch repository tree
    const treeResponse = await fetch(
      'https://api.github.com/repos/logicmonitor/dashboards/git/trees/master?recursive=1',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        }
    });

    const treeData = await treeResponse.json();
    
    // Process each JSON file
    const dashboardFiles = treeData.tree
      .filter((item: any) => 
        item.path.endsWith('.json') && 
        !item.path.includes('Archive/') &&
        item.type === 'blob'
      );

    // Update database
    for (const file of dashboardFiles) {
      const pathParts = file.path.split('/');
      const category = pathParts.length > 1 ? pathParts[0] : 'Uncategorized';
      
      // Fetch the actual JSON content
      const contentResponse = await fetch(
        `https://raw.githubusercontent.com/logicmonitor/dashboards/master/${file.path}`
      );
      const content = await contentResponse.json();

      // Upsert into Supabase
      const { error } = await supabase
        .from('dashboard-configs')
        .upsert({
          category,
          filename: pathParts[pathParts.length - 1],
          path: file.path,
          content,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'path'
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
} 