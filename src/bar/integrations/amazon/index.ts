import type { DomainPageEligibility, DomainPageRule } from '../types';

const AMAZON_DOMAINS = [
    'amazon.com',
    'amazon.co.uk',
    'amazon.fr',
    'amazon.es',
    'amazon.de',
    'amazon.it',
];

const DIGITAL_SELLER_IDS_BY_DOMAIN: Readonly<Record<string, string>> = {
    'amazon.com': 'A3ODHND3J0WMC8',
    'amazon.co.uk': 'AR9ZQCUDB1BRG',
    'amazon.es': 'A8FQRD0WW0VW5',
    'amazon.de': 'A23R8XU9UYU5MY',
    'amazon.fr': 'A3G9IOHQDOG823',
    'amazon.it': 'A2VH1G09VXWEK4',
};

export const resolveAmazonTitle = (): string | null => {
    const title = document.querySelector<HTMLElement>('#productTitle')?.textContent?.trim();
    return title || null;
};

export const resolveAmazonRequestUrl = (): string | null => {
    // Keep the complete Amazon URL. Its locale/category/ref data is useful to the
    // server, and isSupportedProductPage has already verified the product URL shape
    return window.location.href || document.URL || null;
};

function normalizeAmazonDomain(hostname: string): string {
    return hostname.trim().toLowerCase().replace(/^www\./, '');
}

function resolveAmazonSellerId(): string | null {
    const sellerLink = document.querySelector<HTMLAnchorElement>(
        'a#sellerProfileTriggerId[href]',
    );

    if (!sellerLink) {
        return null;
    }

    try {
        const sellerId = new URL(
            sellerLink.href,
            window.location.origin,
        ).searchParams.get('seller')?.trim().toUpperCase();

        return sellerId || null;
    } catch {
        return null;
    }
}

export const resolveAmazonPageEligibility = (): DomainPageEligibility => {
    const domain = normalizeAmazonDomain(window.location.hostname);
    const expectedSellerId = DIGITAL_SELLER_IDS_BY_DOMAIN[domain];

    if (!expectedSellerId) {
        return {
            status: 'unknown',
            reason: 'Amazon marketplace does not have an approved digital seller ID',
            evidence: [`domain=${domain}`],
        };
    }

    const sellerId = resolveAmazonSellerId();
    if (sellerId === expectedSellerId) {
        return {
            status: 'eligible',
            reason: 'digital product confirmed by approved Amazon seller ID',
            evidence: [`domain=${domain}`, `seller=${sellerId}`],
        };
    }

    return {
        status: 'unknown',
        reason: sellerId
            ? 'seller ID is not approved for digital products on this Amazon marketplace'
            : 'Amazon seller link or seller ID was not found',
        evidence: [
            `domain=${domain}`,
            `expectedSeller=${expectedSellerId}`,
            `seller=${sellerId ?? '<missing>'}`,
        ],
    };
};

export const amazonPageRules: DomainPageRule[] = AMAZON_DOMAINS.map((domain) => ({
    domain,
    resolvePageEligibility: resolveAmazonPageEligibility,
    resolveTitle: resolveAmazonTitle,
    resolveRequestUrl: resolveAmazonRequestUrl,
    omitSourceUrl: true,
    eligibilityResolveRetryMs: 5000,
    titleResolveRetryMs: 5000,
}));
