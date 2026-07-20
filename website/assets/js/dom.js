export function clearElement(element) {
    element.replaceChildren();
}

export function createElement(tagName, options = {}, children = []) {
    const element = document.createElement(tagName);
    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;

    for (const [name, value] of Object.entries(options.attributes || {})) {
        if (value !== null && value !== undefined && value !== false) {
            element.setAttribute(name, String(value));
        }
    }

    for (const child of Array.isArray(children) ? children : [children]) {
        if (child) element.append(child);
    }

    return element;
}

export function normalizeExternalUrl(value) {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

export function createExternalLink(url, text, className = '') {
    const safeUrl = normalizeExternalUrl(url);
    if (!safeUrl) return null;

    return createElement('a', {
        className,
        text,
        attributes: {
            href: safeUrl,
            target: '_blank',
            rel: 'noopener noreferrer'
        }
    });
}
