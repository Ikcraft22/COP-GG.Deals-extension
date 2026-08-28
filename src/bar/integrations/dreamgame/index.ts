import type { DomainPageRule } from '../types';

export const resolveDreamgameTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const dreamgamePageRule: DomainPageRule = {
    domain: 'dreamgame.com',
    resolveTitle: resolveDreamgameTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
