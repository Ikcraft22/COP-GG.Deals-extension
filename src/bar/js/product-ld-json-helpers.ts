export type LdJsonObject = Record<string, unknown>;

type CachedProductNodes = {
    content: string;
    productNodes: LdJsonObject[];
};

const DEFAULT_LD_JSON_SELECTOR = 'script[type="application/ld+json"]';
const productNodeCache = new WeakMap<HTMLScriptElement, CachedProductNodes>();

function isLdJsonObject(value: unknown): value is LdJsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function hasLdJsonSchemaType(node: LdJsonObject, type: string): boolean {
    const schemaType = node['@type'];
    return schemaType === type || (Array.isArray(schemaType) && schemaType.includes(type));
}

function collectProductNodes(node: unknown, result: LdJsonObject[]): void {
    if (Array.isArray(node)) {
        node.forEach((item) => collectProductNodes(item, result));
        return;
    }

    if (!isLdJsonObject(node)) {
        return;
    }

    if (hasLdJsonSchemaType(node, 'Product')) {
        result.push(node);
    }

    if (Array.isArray(node['@graph'])) {
        node['@graph'].forEach((item) => collectProductNodes(item, result));
    }
}

function readProductNodes(script: HTMLScriptElement): LdJsonObject[] {
    const content = script.textContent?.trim() ?? '';
    const cached = productNodeCache.get(script);
    if (cached?.content === content) {
        return cached.productNodes;
    }

    const productNodes: LdJsonObject[] = [];
    if (content.length > 0) {
        try {
            collectProductNodes(JSON.parse(content) as unknown, productNodes);
        } catch {
            // Ignore malformed blocks; a later DOM update may provide valid JSON.
        }
    }

    productNodeCache.set(script, { content, productNodes });
    return productNodes;
}

export function getLdJsonProductNodes(selector = DEFAULT_LD_JSON_SELECTOR): LdJsonObject[] {
    const scripts = document.querySelectorAll<HTMLScriptElement>(selector);
    const productNodes: LdJsonObject[] = [];

    scripts.forEach((script) => {
        productNodes.push(...readProductNodes(script));
    });

    return productNodes;
}

export function normalizeLdJsonUrlForComparison(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
    }

    try {
        const url = new URL(value, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const pathname = url.pathname.replace(/\/+$/, '') || '/';
        return `${url.protocol}//${hostname}${url.port ? `:${url.port}` : ''}${pathname}`;
    } catch {
        return null;
    }
}

export function isCurrentPageLdJsonProduct(
    node: LdJsonObject,
    requiredTypes: readonly string[] = [],
): boolean {
    if (!requiredTypes.every((type) => hasLdJsonSchemaType(node, type))) {
        return false;
    }

    const productUrl = normalizeLdJsonUrlForComparison(node.url ?? node['@id']);
    const currentUrl = normalizeLdJsonUrlForComparison(window.location.href);
    return productUrl !== null && productUrl === currentUrl;
}
