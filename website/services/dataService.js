/**
 * 資料載入與驗證服務
 */

function isValidIssue(issue) {
    if (!issue || typeof issue !== 'object') return false;

    return Number.isInteger(issue.id)
        && typeof issue.title === 'string'
        && issue.title.trim().length > 0
        && typeof issue.status === 'string'
        && issue.status.trim().length > 0
        && typeof issue.url === 'string'
        && issue.url.trim().length > 0
        && typeof issue.createdAt === 'string'
        && issue.createdAt.trim().length > 0;
}

function validateIssuesPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return {
            ok: false,
            type: 'schema',
            message: '資料格式錯誤：payload 必須是物件'
        };
    }

    if (!Array.isArray(payload.issues)) {
        return {
            ok: false,
            type: 'schema',
            message: '資料格式錯誤：issues 必須是陣列'
        };
    }

    const validIssues = [];
    const skippedIssues = [];

    payload.issues.forEach((issue, index) => {
        if (isValidIssue(issue)) {
            validIssues.push(issue);
            return;
        }

        skippedIssues.push({ index, issue });
        console.warn('[schema] 跳過非法 issue:', { index, issue });
    });

    return {
        ok: true,
        type: validIssues.length === 0 ? 'empty' : 'success',
        issues: validIssues,
        skippedIssues,
        payload: {
            ...payload,
            issues: validIssues
        }
    };
}

async function fetchIssuesData(url) {
    let payload;

    try {
        const response = await fetch(url);
        payload = await response.json();
    } catch (error) {
        return {
            ok: false,
            type: 'network',
            message: '網路錯誤：無法載入資料',
            error
        };
    }

    return validateIssuesPayload(payload);
}
