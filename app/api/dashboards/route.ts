import { NextResponse } from 'next/server';
import { getDefaultBranch } from '../../utils/github';

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
    // First, get the default branch
    const defaultBranch = await getDefaultBranch('logicmonitor', 'dashboards');

    // Then get the repository tree using the default branch
    const treeResponse = await fetch(
      `https://api.github.com/repos/logicmonitor/dashboards/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
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