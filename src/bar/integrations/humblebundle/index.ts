import type { DomainPageEligibility, DomainPageRule } from '../types';
import { extractPageIdentityFromLdJson } from '../../js/ld-json-helpers';
import {
    getLdJsonProductNodes,
    isCurrentPageLdJsonProduct,
} from '../../js/product-ld-json-helpers';

export const resolveHumbleBundlePageEligibility = (): DomainPageEligibility => {
    const productNodes = getLdJsonProductNodes();

    if (productNodes.length === 0) {
        return {
            status: 'unknown',
            reason: 'Humble Bundle Product LD+JSON is not available yet',
        };
    }

    if (productNodes.some((node) => isCurrentPageLdJsonProduct(node, ['VideoGame']))) {
        return {
            status: 'eligible',
            reason: 'Humble Bundle game confirmed by Product and VideoGame LD+JSON types',
        };
    }

    return {
        status: 'ineligible',
        reason: 'Humble Bundle page does not have a matching VideoGame Product LD+JSON node',
        evidence: [`productNodes=${productNodes.length}`],
    };
};

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeMetaTitle(value: string | null | undefined): string | null {
    const normalized = normalizeText(value);
    if (!normalized) {
        return null;
    }

    return normalized.replace(/\s*[|–—-]\s*Humble Bundle\s*$/i, '').trim() || null;
}

export const resolveHumbleBundleTitle = (): string | null => {
    const productTitleSelectors = [
        'h1[data-entity-kind="product"]',
        '[data-entity-kind="product"] h1',
        '[data-entity-kind="product"] .entity-title',
        'main .product-title > h2',
        'main .entity-title',
    ];

    for (const selector of productTitleSelectors) {
        const productTitle = document.querySelector(selector) as HTMLElement | null;
        const title = normalizeText(productTitle?.textContent);
        if (title) {
            return title;
        }
    }

    const ldJsonTitle = normalizeText(extractPageIdentityFromLdJson().title);
    if (ldJsonTitle) {
        return ldJsonTitle;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    return normalizeMetaTitle(ogTitle?.content);
};

export const humbleBundlePageRule: DomainPageRule = {
    domain: 'humblebundle.com',
    resolvePageEligibility: resolveHumbleBundlePageEligibility,
    resolveTitle: resolveHumbleBundleTitle,
    resolveRequestUrl: () => window.location.href,
    eligibilityResolveRetryMs: 5000,
    titleResolveRetryMs: 3000,
};
