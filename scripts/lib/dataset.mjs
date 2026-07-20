import { extractIssueFields } from './issue-form.mjs';

export function getLabelNames(labels = []) {
  return labels.map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean);
}

function valueFromLabels(labels, prefix, allowedValues) {
  for (const label of labels) {
    if (!label.startsWith(prefix)) continue;
    const value = label.slice(prefix.length);
    if (allowedValues.has(value)) return value;
  }
  return '';
}

export function normalizeIssue(issue, taxonomy) {
  const labels = getLabelNames(issue.labels);
  const parsed = extractIssueFields(issue.body || '', taxonomy);
  const allowedCities = new Set(taxonomy.cities.map((item) => item.name));
  const allowedTypes = new Set(taxonomy.issueTypes.map((item) => item.value));
  const allowedStatuses = new Set(taxonomy.statuses.map((item) => item.value));
  const city = valueFromLabels(labels, taxonomy.labelPrefixes.city, allowedCities) || parsed.city;
  const type = valueFromLabels(labels, taxonomy.labelPrefixes.type, allowedTypes) || parsed.type;
  const status = valueFromLabels(labels, taxonomy.labelPrefixes.status, allowedStatuses)
    || taxonomy.defaults.status;

  return {
    id: issue.number,
    title: issue.title || '',
    url: issue.html_url || '',
    location: parsed.location,
    mapUrl: parsed.mapUrl,
    coordinates: parsed.coordinates,
    positionPrecision: parsed.coordinates ? 'exact' : city ? 'city' : 'unknown',
    city,
    type,
    status,
    state: issue.state || 'open',
    labels,
    createdAt: issue.created_at || null,
    updatedAt: issue.updated_at || null,
    closedAt: issue.closed_at || null
  };
}

export function buildStats(issues) {
  const stats = {
    total: issues.length,
    byStatus: {},
    byCity: {},
    byType: {}
  };

  for (const issue of issues) {
    stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;
    if (issue.city) stats.byCity[issue.city] = (stats.byCity[issue.city] || 0) + 1;
    if (issue.type) stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1;
  }

  return stats;
}

export function buildDataset(rawIssues, taxonomy, options = {}) {
  const issues = rawIssues
    .filter((issue) => !issue.pull_request)
    .map((issue) => normalizeIssue(issue, taxonomy))
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || new Date().toISOString(),
    source: {
      repository: options.repository || ''
    },
    stats: buildStats(issues),
    issues
  };
}
