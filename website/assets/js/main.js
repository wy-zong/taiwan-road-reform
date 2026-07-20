import { loadApplicationData } from './data.js';
import { setupFilters } from './filters.js';
import { renderIssueList } from './issue-list.js';
import { createIssueMap, renderLegend } from './map.js';
import { createIssueState } from './state.js';
import { renderGeneratedAt, renderStats } from './stats.js';

function showMessage(message, kind = 'info') {
    const element = document.getElementById('app-message');
    element.textContent = message;
    element.dataset.kind = kind;
    element.hidden = false;
}

function setupMobileView(mainLayout, mapController) {
    const buttons = [...document.querySelectorAll('[data-view]')];

    function setView(view) {
        mainLayout.dataset.mobileView = view;
        for (const button of buttons) {
            const active = button.dataset.view === view;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        }
        if (view === 'map') window.setTimeout(() => mapController.invalidateSize(), 0);
    }

    for (const button of buttons) button.addEventListener('click', () => setView(button.dataset.view));
    return setView;
}

async function initialize() {
    const mainLayout = document.getElementById('main-layout');

    try {
        const { dataset, taxonomy } = await loadApplicationData();
        const state = createIssueState(dataset.issues);
        const mapController = createIssueMap(taxonomy);
        const setMobileView = setupMobileView(mainLayout, mapController);

        const render = () => {
            const issues = state.getFilteredIssues();
            mapController.render(issues);
            renderIssueList(issues, taxonomy, (issueId) => {
                if (window.matchMedia('(max-width: 900px)').matches) setMobileView('map');
                window.setTimeout(() => mapController.focus(issueId), 0);
            });
        };

        renderStats(dataset.stats, taxonomy);
        renderGeneratedAt(dataset.generatedAt);
        renderLegend(taxonomy);
        setupFilters({
            taxonomy,
            issues: dataset.issues,
            onChange(filters) {
                for (const [name, value] of Object.entries(filters)) state.setFilter(name, value);
                render();
            }
        });
        render();

        if (dataset.issues.length === 0) showMessage('目前還沒有道路問題回報，歡迎成為第一位回報者。');
    } catch (error) {
        console.error(error);
        showMessage('資料載入失敗，請稍後重試或前往 GitHub 查看案件。', 'error');
        document.getElementById('issues-list').textContent = '無法載入案件資料';
    }
}

document.addEventListener('DOMContentLoaded', initialize);
