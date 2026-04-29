import { getIssues, setIssues, getFilters, setFilters, resetFilters } from './state.js';
import { fetchIssuesData, DataServiceError, runSmokeValidation } from './services/dataService.js';
import { initMap, renderMarkers, focusIssue } from './map/mapRenderer.js';
import { renderCityFilter, setupFilters, readFilters, resetFilterInputs } from './ui/filterPanel.js';
import { renderIssuesList, renderListMessage } from './ui/issuesList.js';
import { renderStats, renderLastUpdated } from './ui/statsPanel.js';

export function applyFilters(issues, filters) {
  return issues.filter((issue) => {
    if (filters.city && issue.city !== filters.city) return false;
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.type && issue.type !== filters.type) return false;
    return true;
  });
}

function render(issues) {
  renderIssuesList(issues, (issueId) => focusIssue(issueId, getIssues()));
  renderMarkers(issues);
}

function onFilterChange() {
  setFilters(readFilters());
  const filtered = applyFilters(getIssues(), getFilters());
  render(filtered);
}

export async function bootstrap() {
  initMap();
  setupFilters(onFilterChange, () => {
    resetFilterInputs();
    resetFilters();
    render(getIssues());
  });

  const smoke = runSmokeValidation();
  if (!smoke.passed) {
    console.warn('Smoke validation failed', smoke.results);
  }

  try {
    const data = await fetchIssuesData('data.json');
    setIssues(data.issues);
    renderStats(data.stats);
    renderLastUpdated(data.lastUpdated);
    renderCityFilter(getIssues());

    if (data.issues.length === 0) {
      renderListMessage('目前沒有任何問題回報<br>成為第一個回報者吧！');
      renderMarkers([]);
      return;
    }

    render(data.issues);
  } catch (error) {
    if (error instanceof DataServiceError) {
      console.error(`[${error.type}]`, error.message);
    } else {
      console.error(error);
    }
    renderListMessage('資料載入失敗，請稍後再試。');
    renderMarkers([]);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
