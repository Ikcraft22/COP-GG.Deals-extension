import type { DomainPageRule } from '../types';

export const resolvePremiumCdKeysTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const premiumCdKeysPageRule: DomainPageRule = {
    domain: 'premiumcdkeys.com',
    resolveTitle: resolvePremiumCdKeysTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
