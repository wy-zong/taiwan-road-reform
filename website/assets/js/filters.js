function appendOptions(select, items, getValue, getLabel = getValue) {
    for (const item of items) {
        const option = document.createElement('option');
        option.value = getValue(item);
        option.textContent = getLabel(item);
        select.append(option);
    }
}

export function setupFilters({ taxonomy, issues, onChange }) {
    const citySelect = document.getElementById('filter-city');
    const statusSelect = document.getElementById('filter-status');
    const typeSelect = document.getElementById('filter-type');
    const resetButton = document.getElementById('reset-filters');
    const availableCities = new Set(issues.map((issue) => issue.city).filter(Boolean));

    appendOptions(
        citySelect,
        taxonomy.cities.filter((city) => availableCities.has(city.name)),
        (city) => city.name
    );
    appendOptions(statusSelect, taxonomy.statuses, (status) => status.value);
    appendOptions(typeSelect, taxonomy.issueTypes, (type) => type.value);

    const notify = () => onChange({
        city: citySelect.value,
        status: statusSelect.value,
        type: typeSelect.value
    });

    citySelect.addEventListener('change', notify);
    statusSelect.addEventListener('change', notify);
    typeSelect.addEventListener('change', notify);
    resetButton.addEventListener('click', () => {
        citySelect.value = '';
        statusSelect.value = '';
        typeSelect.value = '';
        notify();
    });
}
