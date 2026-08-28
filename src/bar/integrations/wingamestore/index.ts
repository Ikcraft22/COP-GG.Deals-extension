import type { DomainPageRule } from '../types';

export const resolveWinGameStoreTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const winGameStorePageRule: DomainPageRule = {
    domain: 'wingamestore.com',
    resolveTitle: resolveWinGameStoreTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
