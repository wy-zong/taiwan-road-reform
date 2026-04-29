export function renderCityFilter(issues) {
  const select = document.getElementById('filter-city');
  select.querySelectorAll('option:not([value=""])').forEach((o) => o.remove());
  [...new Set(issues.map((i) => i.city).filter(Boolean))].sort().forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    select.appendChild(option);
  });
}

export function setupFilters(onChange, onReset) {
  ['filter-city', 'filter-status', 'filter-type'].forEach((id) => {
    document.getElementById(id).addEventListener('change', onChange);
  });
  document.getElementById('reset-filters').addEventListener('click', onReset);
}

export function readFilters() {
  return {
    city: document.getElementById('filter-city').value,
    status: document.getElementById('filter-status').value,
    type: document.getElementById('filter-type').value,
  };
}

export function resetFilterInputs() {
  document.getElementById('filter-city').value = '';
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-type').value = '';
}
