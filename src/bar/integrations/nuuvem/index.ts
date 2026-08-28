import type { DomainPageRule } from '../types';

export const resolveNuuvemTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const nuuvemPageRule: DomainPageRule = {
    domain: 'nuuvem.com',
    resolveTitle: resolveNuuvemTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
