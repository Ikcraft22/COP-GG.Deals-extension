import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveLootbarTitle = (): string | null => {
    const titleFromProductBanner = document.querySelector('h1.product-banner-name, h1[class*="product-banner-name"]') as HTMLHeadingElement | null;
    const productBannerTitle = normalizeText(titleFromProductBanner?.textContent);
    if (productBannerTitle) {
        return productBannerTitle;
    }

    const titleFromHeading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(titleFromHeading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    return null;
};

export const lootbarPageRule: DomainPageRule = {
    domain: 'lootbar.com',
    resolveTitle: resolveLootbarTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 7000,
};