export async function getDefaultBranch(owner: string, repo: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch repository information');
  }

  const data = await response.json();
  return data.default_branch;
} 