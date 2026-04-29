function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
function getStatusClass(status) { return ({ '待確認':'pending','已確認':'confirmed','已陳情':'petitioned','處理中':'processing','已解決':'resolved','無法解決':'unresolvable' })[status] || 'pending'; }

export function renderIssuesList(issues, onFocusIssue) {
  const container = document.getElementById('issues-list');
  document.getElementById('issues-count').textContent = issues.length;

  if (issues.length === 0) {
    container.innerHTML = '<p class="no-issues">沒有符合條件的問題</p>';
    return;
  }

  const sorted = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  container.innerHTML = sorted.map((issue) => `
    <div class="issue-card" data-issue-id="${issue.id}">
      <div class="issue-card-header"><span class="issue-card-title">${escapeHtml(issue.title)}</span><span class="issue-card-id">#${issue.id}</span></div>
      <div class="issue-card-meta"><span class="issue-tag status status-${getStatusClass(issue.status)}">${issue.status}</span>${issue.city ? `<span class="issue-tag city">${issue.city}</span>` : ''}</div>
    </div>
  `).join('');

  container.querySelectorAll('.issue-card').forEach((card) => {
    card.addEventListener('click', () => onFocusIssue(Number(card.dataset.issueId)));
  });
}

export function renderListMessage(message) {
  document.getElementById('issues-count').textContent = '0';
  document.getElementById('issues-list').innerHTML = `<p class="no-issues">${message}</p>`;
}
