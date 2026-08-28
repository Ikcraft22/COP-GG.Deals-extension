import type { DomainPageRule } from '../types';

export const resolveDiscoverGamesTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
};

export const discoverGamesPageRule: DomainPageRule = {
    domain: 'discover.games',
    resolveTitle: resolveDiscoverGamesTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
