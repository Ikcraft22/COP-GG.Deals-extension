import type { DomainPageRule } from '../types';

export const resolveGamesplanetTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const productTitle = heading?.querySelector('.prod-title');
    const title = productTitle?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const gamesplanetPageRule: DomainPageRule = {
    domain: 'gamesplanet.com',
    resolveTitle: resolveGamesplanetTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
