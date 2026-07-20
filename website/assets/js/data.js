async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} 載入失敗（HTTP ${response.status}）`);
    return response.json();
}

function validateDataset(dataset) {
    if (dataset?.schemaVersion !== 1 || !Array.isArray(dataset.issues)) {
        throw new Error('網站資料格式不正確');
    }
}

function validateTaxonomy(taxonomy) {
    if (
        taxonomy?.schemaVersion !== 1
        || !Array.isArray(taxonomy.cities)
        || !Array.isArray(taxonomy.statuses)
        || !Array.isArray(taxonomy.issueTypes)
    ) {
        throw new Error('分類設定格式不正確');
    }
}

export async function loadApplicationData() {
    const [dataset, taxonomy] = await Promise.all([
        fetchJson('data/issues.json'),
        fetchJson('data/taxonomy.json')
    ]);

    validateDataset(dataset);
    validateTaxonomy(taxonomy);
    return { dataset, taxonomy };
}
