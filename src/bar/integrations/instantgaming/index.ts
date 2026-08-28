import type { DomainPageRule } from '../types';

export const resolveInstantGamingTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const instantGamingPageRule: DomainPageRule = {
    domain: 'instant-gaming.com',
    resolveTitle: resolveInstantGamingTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
