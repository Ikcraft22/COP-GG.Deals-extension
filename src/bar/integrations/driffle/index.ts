import type { DomainPageRule } from '../types';

export const resolveDriffleTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const drifflePageRule: DomainPageRule = {
    domain: 'driffle.com',
    resolveTitle: resolveDriffleTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
