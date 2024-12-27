import { NextResponse } from 'next/server';

interface GithubTreeItem {
  path: string;
  type: string;
  url?: string;
  sha: string;
}

interface GithubContent {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

export async function GET() {
  try {
    // First, get the repository tree to find all JSON files
    const treeResponse = await fetch(
      'https://api.github.com/repos/logicmonitor/dashboards/git/trees/master?recursive=1',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` // Optional: for higher rate limits
        }
    });

    if (!treeResponse.ok) {
      throw new Error('Failed to fetch repository tree');
    }

    const treeData = await treeResponse.json();
    
    // Filter for JSON files only and organize by category (folder)
    const dashboardFiles = treeData.tree
      .filter((item: GithubTreeItem) => 
        item.path.endsWith('.json') && 
        !item.path.includes('Archive/') && // Exclude Archive folder
        item.type === 'blob'
      )
      .map((item: GithubTreeItem) => {
        const pathParts = item.path.split('/');
        return {
          category: pathParts.length > 1 ? pathParts[0] : 'Uncategorized',
          filename: pathParts[pathParts.length - 1],
          path: item.path,
          url: item.url
        };
      });

    // Group dashboards by category
    const dashboardsByCategory = dashboardFiles.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return NextResponse.json({
      categories: Object.keys(dashboardsByCategory),
      dashboards: dashboardsByCategory
    });

  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
} 