import type { DomainPageRule } from '../types';

export const resolveG2aTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const g2aPageRule: DomainPageRule = {
    domain: 'g2a.com',
    resolveTitle: resolveG2aTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
