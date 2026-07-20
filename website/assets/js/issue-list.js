import { clearElement, createElement, createExternalLink } from './dom.js';

function statusClass(status, taxonomy) {
    return taxonomy.statuses.find((item) => item.value === status)?.cssClass || 'pending';
}

function createTag(text, className) {
    return createElement('span', { className: `issue-tag ${className}`, text });
}

function createIssueCard(issue, taxonomy, onFocus) {
    const focusButton = createElement('button', {
        className: 'issue-card-focus',
        attributes: {
            type: 'button',
            'aria-label': `在地圖查看第 ${issue.id} 號問題：${issue.title}`
        }
    }, [
        createElement('span', { className: 'issue-card-title', text: issue.title }),
        createElement('span', { className: 'issue-card-id', text: `#${issue.id}` })
    ]);
    focusButton.addEventListener('click', () => onFocus(issue.id));

    const metadata = createElement('div', { className: 'issue-card-meta' }, [
        createTag(issue.status, `status status-${statusClass(issue.status, taxonomy)}`),
        issue.city ? createTag(issue.city, 'city') : null,
        issue.type ? createTag(issue.type, 'type') : null,
        issue.positionPrecision === 'city' ? createTag('縣市位置', 'precision') : null,
        issue.url ? createExternalLink(issue.url, 'GitHub ↗', 'issue-tag external') : null
    ]);

    return createElement('article', { className: 'issue-card' }, [focusButton, metadata]);
}

export function renderIssueList(issues, taxonomy, onFocus) {
    const container = document.getElementById('issues-list');
    const countElement = document.getElementById('issues-count');
    countElement.textContent = String(issues.length);
    clearElement(container);

    if (issues.length === 0) {
        container.append(createElement('p', { className: 'no-issues', text: '沒有符合條件的問題' }));
        return;
    }

    for (const issue of issues) container.append(createIssueCard(issue, taxonomy, onFocus));
}
