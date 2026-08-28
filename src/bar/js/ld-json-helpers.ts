export type PageIdentity = {
    requestUrl?: string;
    title?: string;
};

function normalizeText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function getObjectType(value: unknown): string | undefined {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const typeValue = (value as { '@type'?: unknown })['@type'];
    if (typeof typeValue === 'string') {
        return typeValue;
    }

    if (Array.isArray(typeValue)) {
        const firstStringType = typeValue.find((entry) => typeof entry === 'string');
        return typeof firstStringType === 'string' ? firstStringType : undefined;
    }

    return undefined;
}

function toAbsoluteUrl(value: unknown): string | undefined {
    const normalized = normalizeText(value);
    if (!normalized) {
        return undefined;
    }

    try {
        return new globalThis.URL(normalized, window.location.href).href;
    } catch {
        return undefined;
    }
}

function titleFromUrl(urlValue: string): string | undefined {
    try {
        const parsed = new globalThis.URL(urlValue);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const slug = parts[parts.length - 1];
        if (!slug) {
            return undefined;
        }

        const cleanedSlug = slug
            .replace(/\.[a-z0-9]+$/i, '')
            .replace(/-[a-z]\d+$/i, '')
            .replace(/[_-]+/g, ' ')
            .trim();

        return cleanedSlug.length > 0 ? cleanedSlug : undefined;
    } catch {
        return undefined;
    }
}

function extractFromBreadcrumbList(node: Record<string, unknown>): PageIdentity {
    const items = node.itemListElement;
    if (!Array.isArray(items) || items.length === 0) {
        return {};
    }

    const lastItem = items[items.length - 1];
    if (!lastItem || typeof lastItem !== 'object') {
        return {};
    }

    const listItem = lastItem as Record<string, unknown>;
    const itemNode = (listItem.item && typeof listItem.item === 'object')
        ? (listItem.item as Record<string, unknown>)
        : listItem;

    const requestUrl = toAbsoluteUrl(itemNode['@id'] ?? itemNode.url ?? listItem.item);
    const title = normalizeText(itemNode.name ?? listItem.name) ?? (requestUrl ? titleFromUrl(requestUrl) : undefined);

    return {
        requestUrl,
        title,
    };
}

function extractFromProduct(node: Record<string, unknown>): PageIdentity {
    const requestUrl = toAbsoluteUrl(node.url ?? node['@id']);
    const title = normalizeText(node.name) ?? (requestUrl ? titleFromUrl(requestUrl) : undefined);

    return {
        requestUrl,
        title,
    };
}

function mergeIdentity(primary: PageIdentity, fallback: PageIdentity): PageIdentity {
    return {
        requestUrl: primary.requestUrl ?? fallback.requestUrl,
        title: primary.title ?? fallback.title,
    };
}

function extractPageIdentityFromLdNode(node: unknown): PageIdentity {
    if (!node || typeof node !== 'object') {
        return {};
    }

    const asObject = node as Record<string, unknown>;
    let extracted: PageIdentity = {};
    const objectType = getObjectType(asObject);

    if (objectType === 'BreadcrumbList') {
        extracted = mergeIdentity(extracted, extractFromBreadcrumbList(asObject));
    }

    if (objectType === 'Product') {
        extracted = mergeIdentity(extracted, extractFromProduct(asObject));
    }

    if (Array.isArray(asObject['@graph'])) {
        for (const graphNode of asObject['@graph'] as unknown[]) {
            extracted = mergeIdentity(extracted, extractPageIdentityFromLdNode(graphNode));
        }
    }

    if (Array.isArray(node)) {
        for (const arrayNode of node) {
            extracted = mergeIdentity(extracted, extractPageIdentityFromLdNode(arrayNode));
        }
    }

    return extracted;
}

export function extractPageIdentityFromLdJson(): PageIdentity {
    const ldScripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
    let identity: PageIdentity = {};

    for (const scriptElement of ldScripts) {
        const rawContent = scriptElement.textContent;
        if (!rawContent || rawContent.trim().length === 0) {
            continue;
        }

        try {
            const parsed = JSON.parse(rawContent) as unknown;
            identity = mergeIdentity(identity, extractPageIdentityFromLdNode(parsed));
        } catch {
            // Ignore malformed LD+JSON blocks and continue with remaining scripts.
        }
    }

    return identity;
}
