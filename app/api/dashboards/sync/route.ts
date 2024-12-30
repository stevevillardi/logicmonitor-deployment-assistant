import supabase from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import { getDefaultBranch } from '../../../utils/github';

async function handleSync() {
  try {
    // First, get the default branch
    const defaultBranch = await getDefaultBranch('logicmonitor', 'dashboards');

    // Fetch repository tree using the default branch
    const treeResponse = await fetch(
      `https://api.github.com/repos/logicmonitor/dashboards/git/trees/${defaultBranch}?recursive=1`,
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
        !item.path.includes('Packages/') &&
        item.type === 'blob'
      );

    // Update database
    for (const file of dashboardFiles) {
      const pathParts = file.path.split('/');
      const category = pathParts.length > 1 ? pathParts[0] : 'Uncategorized';
      
      // Fetch the actual JSON content using the default branch
      const contentResponse = await fetch(
        `https://raw.githubusercontent.com/logicmonitor/dashboards/${defaultBranch}/${file.path}`
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

export async function POST(request: Request) {
  // Verify the cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized Sync' }, { status: 401 });
  }

  return handleSync();
}

export async function GET(request: Request) {
  // Verify the cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized Sync' }, { status: 401 });
  }

  return handleSync();
} 