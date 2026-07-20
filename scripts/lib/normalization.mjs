import { extractIssueFields } from './issue-form.mjs';
import { getLabelNames } from './dataset.mjs';

function findStatusLabel(payload, currentLabels, taxonomy) {
  const validLabels = new Set(taxonomy.statuses.map((item) => item.label));
  const eventLabel = payload.action === 'labeled' ? payload.label?.name : '';
  if (validLabels.has(eventLabel)) return eventLabel;

  const current = currentLabels.find((label) => validLabels.has(label));
  if (current) return current;

  return taxonomy.statuses.find((item) => item.value === taxonomy.defaults.status)?.label || '';
}

export function getLabelDefinition(label, taxonomy) {
  const status = taxonomy.statuses.find((item) => item.label === label);
  if (status) return { name: label, color: status.color, description: status.description };

  const type = taxonomy.issueTypes.find((item) => item.label === label);
  if (type) {
    return {
      name: label,
      color: taxonomy.labelColors.type,
      description: type.description
    };
  }

  if (label.startsWith(taxonomy.labelPrefixes.city)) {
    const city = label.slice(taxonomy.labelPrefixes.city.length);
    return {
      name: label,
      color: taxonomy.labelColors.city,
      description: `${city}道路問題`
    };
  }

  return null;
}

export function buildNormalizationPlan(payload, taxonomy) {
  const issue = payload.issue || {};
  const currentLabels = getLabelNames(issue.labels);
  const parsed = extractIssueFields(issue.body || '', taxonomy);
  const prefixes = Object.values(taxonomy.labelPrefixes);
  const managedCurrent = currentLabels.filter((label) => prefixes.some((prefix) => label.startsWith(prefix)));
  const validCityLabels = new Set(
    taxonomy.cities.map((item) => `${taxonomy.labelPrefixes.city}${item.name}`)
  );
  const validTypeLabels = new Set(taxonomy.issueTypes.map((item) => item.label));
  const currentCity = managedCurrent.find((label) => validCityLabels.has(label));
  const currentType = managedCurrent.find((label) => validTypeLabels.has(label));
  const parsedType = taxonomy.issueTypes.find((item) => item.value === parsed.type)?.label;
  const desired = [
    parsed.city ? `${taxonomy.labelPrefixes.city}${parsed.city}` : currentCity,
    parsedType || currentType,
    findStatusLabel(payload, currentLabels, taxonomy)
  ].filter(Boolean);
  const desiredSet = new Set(desired);

  return {
    issueNumber: issue.number,
    desired,
    definitions: desired.map((label) => getLabelDefinition(label, taxonomy)).filter(Boolean),
    add: desired.filter((label) => !currentLabels.includes(label)),
    remove: managedCurrent.filter((label) => !desiredSet.has(label))
  };
}
