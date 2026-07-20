export function createIssueState(issues) {
    const filters = { city: '', status: '', type: '' };

    return {
        setFilter(name, value) {
            if (Object.hasOwn(filters, name)) filters[name] = value;
        },
        resetFilters() {
            for (const key of Object.keys(filters)) filters[key] = '';
        },
        getFilteredIssues() {
            return issues.filter((issue) => (
                (!filters.city || issue.city === filters.city)
                && (!filters.status || issue.status === filters.status)
                && (!filters.type || issue.type === filters.type)
            ));
        }
    };
}
