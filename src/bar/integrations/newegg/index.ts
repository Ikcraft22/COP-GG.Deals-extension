import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveNeweggTitle = (): string | null => {
    const productHeading = document.querySelector('h1.product-title') as HTMLHeadingElement | null;
    const productTitle = normalizeText(productHeading?.textContent);
    if (productTitle) {
        return productTitle;
    }

    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    return normalizeText(heading?.textContent);
};

export const neweggPageRule: DomainPageRule = {
    domain: 'newegg.com',
    resolveTitle: resolveNeweggTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 5000,
};
