import type { DomainPageRule } from '../types';

export const resolveLoadedTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const loadedPageRule: DomainPageRule = {
    domain: 'loaded.com',
    resolveTitle: resolveLoadedTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
