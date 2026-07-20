import { clearElement, createElement } from './dom.js';

function createStatItem(label, value, color) {
    const valueElement = createElement('span', { className: 'stat-value', text: value });
    if (color) valueElement.style.color = `#${color}`;

    return createElement('div', { className: 'stat-item' }, [
        valueElement,
        createElement('span', { className: 'stat-label', text: label })
    ]);
}

export function renderStats(stats, taxonomy) {
    const container = document.getElementById('stats-grid');
    clearElement(container);
    container.append(createStatItem('總計', stats?.total || 0));

    for (const status of taxonomy.statuses) {
        container.append(createStatItem(
            status.value,
            stats?.byStatus?.[status.value] || 0,
            status.color
        ));
    }
}

export function renderGeneratedAt(timestamp) {
    const element = document.getElementById('last-updated');
    if (!timestamp) {
        element.textContent = '－';
        return;
    }

    const date = new Date(timestamp);
    element.textContent = Number.isNaN(date.getTime())
        ? '－'
        : date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
}
