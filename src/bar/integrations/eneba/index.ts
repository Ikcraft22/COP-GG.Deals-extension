import type { DomainPageEligibility, DomainPageRule } from '../types';
import {
    getLdJsonProductNodes,
    isCurrentPageLdJsonProduct,
    normalizeLdJsonUrlForComparison,
    type LdJsonObject,
} from '../../js/product-ld-json-helpers';

const PRODUCT_LD_JSON_SELECTOR = 'script[type="application/ld+json"][data-rh="true"]';

function normalizeText(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}

function getCurrentEnebaProduct(): LdJsonObject | null {
    return getLdJsonProductNodes(PRODUCT_LD_JSON_SELECTOR)
        .find((node) => isCurrentPageLdJsonProduct(node)) ?? null;
}

export const resolveEnebaPageEligibility = (): DomainPageEligibility => {
    const product = getCurrentEnebaProduct();
    if (product) {
        const requestUrl = normalizeLdJsonUrlForComparison(product.url ?? product['@id']);
        return {
            status: 'eligible',
            reason: 'Eneba product confirmed by matching Product LD+JSON',
            evidence: requestUrl ? [`url=${requestUrl}`] : undefined,
        };
    }

    return {
        status: 'unknown',
        reason: 'matching Eneba Product LD+JSON is not available yet',
        evidence: [PRODUCT_LD_JSON_SELECTOR],
    };
};

export const resolveEnebaPageStateKey = (): string | null => {
    const product = getCurrentEnebaProduct();
    return product ? normalizeLdJsonUrlForComparison(product.url ?? product['@id']) : null;
};

export const getH1Title = (): string | null => {
    const h1Title: Element = document.querySelector('h1') as Element;
    return h1Title?.textContent?.trim() ?? null;
};

export const getMetaTitle = (): string | null => {
    const metaOgTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    const metaTitle = metaOgTitle?.content?.trim();
    if (metaTitle && metaTitle.length > 0) {
        return metaTitle;
    }

    const documentTitle = document.title?.trim();
    return documentTitle && documentTitle.length > 0 ? documentTitle : null;
};

export const resolveEnebaTitle = (): string | null => {
    return normalizeText(getCurrentEnebaProduct()?.name) ?? getH1Title() ?? getMetaTitle();
};

export const enebaPageRule: DomainPageRule = {
    domain: 'eneba.com',
    resolvePageEligibility: resolveEnebaPageEligibility,
    resolvePageStateKey: resolveEnebaPageStateKey,
    resolveTitle: resolveEnebaTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
