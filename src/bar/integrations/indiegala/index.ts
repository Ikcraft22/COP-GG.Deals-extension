import type { DomainPageRule } from '../types';

export const resolveIndiegalaTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const indiegalaPageRule: DomainPageRule = {
    domain: 'indiegala.com',
    resolveTitle: resolveIndiegalaTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
