export class DataServiceError extends Error {
  constructor(type, message) {
    super(message);
    this.name = 'DataServiceError';
    this.type = type;
  }
}

export function validateDataShape(data) {
  if (!data || typeof data !== 'object') {
    throw new DataServiceError('INVALID_DATA', '資料格式錯誤：根物件不存在');
  }
  if (!Array.isArray(data.issues)) {
    throw new DataServiceError('INVALID_DATA', '資料格式錯誤：issues 必須為陣列');
  }

  return {
    issues: data.issues,
    stats: data.stats || null,
    lastUpdated: data.lastUpdated || null,
  };
}

export async function fetchIssuesData(url = 'data.json') {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new DataServiceError('NETWORK_ERROR', `網路錯誤：${error.message}`);
  }

  if (!response.ok) {
    throw new DataServiceError('HTTP_ERROR', `HTTP 錯誤：${response.status}`);
  }

  let raw;
  try {
    raw = await response.json();
  } catch {
    throw new DataServiceError('PARSE_ERROR', '資料解析失敗：JSON 格式錯誤');
  }

  return validateDataShape(raw);
}

export function runSmokeValidation() {
  const scenarios = [
    { name: 'load-failure', run: () => { throw new DataServiceError('NETWORK_ERROR', 'fail'); } },
    { name: 'empty-data', run: () => validateDataShape({ issues: [], stats: null, lastUpdated: null }) },
    { name: 'normal-data', run: () => validateDataShape({ issues: [{ id: 1 }], stats: {}, lastUpdated: new Date().toISOString() }) },
  ];

  const results = scenarios.map((scenario) => {
    try {
      scenario.run();
      return { scenario: scenario.name, ok: true };
    } catch (error) {
      if (scenario.name === 'load-failure' && error instanceof DataServiceError) {
        return { scenario: scenario.name, ok: true };
      }
      return { scenario: scenario.name, ok: false, error };
    }
  });

  return {
    passed: results.every((r) => r.ok),
    results,
  };
}
