import type { DomainPageRule } from '../types';

export const resolveHypeGamesTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const hypeGamesPageRule: DomainPageRule = {
    domain: 'hype.games',
    resolveTitle: resolveHypeGamesTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
