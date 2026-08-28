import type { DomainPageRule } from '../types';

export const resolveK4gTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim().replace(/^Buy\s+/i, '').trim();
    return title && title.length > 0 ? title : null;
};

export const k4gPageRule: DomainPageRule = {
    domain: 'k4g.com',
    resolveTitle: resolveK4gTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
