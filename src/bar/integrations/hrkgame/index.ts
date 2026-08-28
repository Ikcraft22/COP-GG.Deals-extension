import type { DomainPageRule } from '../types';

export const resolveHrkGameTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const hrkGamePageRule: DomainPageRule = {
    domain: 'hrkgame.com',
    resolveTitle: resolveHrkGameTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
