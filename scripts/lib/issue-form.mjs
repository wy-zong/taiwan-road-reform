const FIELD_LABELS = {
  location: '📍 地點',
  mapUrl: '🗺️ 地圖位置連結（選填）',
  city: '🏙️ 縣市',
  issueType: '🏷️ 問題類型',
  customType: '🏷️ 自訂問題類型（選填）'
};

function normalizeHeading(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function trimBlankLines(lines) {
  const result = [...lines];
  while (result[0]?.trim() === '') result.shift();
  while (result.at(-1)?.trim() === '') result.pop();
  return result.join('\n').trim();
}

export function parseIssueForm(body = '') {
  const fields = {};
  let currentHeading = null;
  let currentLines = [];

  const saveCurrentField = () => {
    if (currentHeading) fields[currentHeading] = trimBlankLines(currentLines);
  };

  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^#{2,6}\s+(.+?)\s*$/);
    if (heading) {
      saveCurrentField();
      currentHeading = normalizeHeading(heading[1]);
      currentLines = [];
      continue;
    }

    if (currentHeading) currentLines.push(line);
  }

  saveCurrentField();
  return fields;
}

function firstLine(value = '') {
  return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function decodeSafely(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isTaiwanCoordinate(latitude, longitude) {
  return latitude >= 21.5 && latitude <= 26.6 && longitude >= 118 && longitude <= 122.6;
}

export function parseCoordinates(...values) {
  const patterns = [
    /@(-?\d{1,2}(?:\.\d+)?),(-?\d{2,3}(?:\.\d+)?)/i,
    /[?&#](?:q|query|ll)=(-?\d{1,2}(?:\.\d+)?)(?:,|%2C)(-?\d{2,3}(?:\.\d+)?)/i,
    /#map=\d+(?:\.\d+)?\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{2,3}(?:\.\d+)?)/i
  ];

  for (const rawValue of values.filter(Boolean)) {
    const value = decodeSafely(rawValue);
    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (!match) continue;

      const latitude = Number(match[1]);
      const longitude = Number(match[2]);
      if (isTaiwanCoordinate(latitude, longitude)) return [latitude, longitude];
    }
  }

  return null;
}

export function extractIssueFields(body, taxonomy) {
  const fields = parseIssueForm(body);
  const cityValue = firstLine(fields[FIELD_LABELS.city]);
  const typeValue = firstLine(fields[FIELD_LABELS.issueType]);
  const location = firstLine(fields[FIELD_LABELS.location]);
  const mapUrl = firstLine(fields[FIELD_LABELS.mapUrl]);
  const city = taxonomy.cities.some((item) => item.name === cityValue) ? cityValue : '';
  const issueType = taxonomy.issueTypes.find((item) => item.formValue === typeValue);

  return {
    fields,
    location,
    mapUrl,
    city,
    type: issueType?.value || '',
    typeFormValue: typeValue,
    customType: firstLine(fields[FIELD_LABELS.customType]),
    coordinates: parseCoordinates(mapUrl, location)
  };
}

export { FIELD_LABELS };
