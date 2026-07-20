const API_ROOT = 'https://api.github.com';

export function createGitHubClient({ token, repository }) {
  if (!token) throw new Error('缺少 GITHUB_TOKEN');
  if (!repository || !repository.includes('/')) throw new Error('缺少有效的 GITHUB_REPOSITORY');

  async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'taiwan-road-reform-action',
        ...(options.headers || {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (options.allow404 && response.status === 404) return null;
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`GitHub API ${response.status}: ${details}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function fetchAllIssues() {
    const issues = [];
    for (let page = 1; ; page += 1) {
      const batch = await request(`/repos/${repository}/issues?state=all&per_page=100&page=${page}`);
      issues.push(...batch);
      if (batch.length < 100) break;
    }
    return issues;
  }

  async function fetchAllLabels() {
    const labels = [];
    for (let page = 1; ; page += 1) {
      const batch = await request(`/repos/${repository}/labels?per_page=100&page=${page}`);
      labels.push(...batch);
      if (batch.length < 100) break;
    }
    return labels;
  }

  return { request, fetchAllIssues, fetchAllLabels, repository };
}

export function encodeLabel(label) {
  return encodeURIComponent(label);
}
