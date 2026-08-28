import type { DomainPageRule } from '../types';

export const resolveGamesealTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const gamesealPageRule: DomainPageRule = {
    domain: 'gameseal.com',
    resolveTitle: resolveGamesealTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
