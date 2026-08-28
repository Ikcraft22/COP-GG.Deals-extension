import type { DomainPageRule } from '../types';

export const resolveDifmarkTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const difmarkPageRule: DomainPageRule = {
    domain: 'difmark.com',
    resolveTitle: resolveDifmarkTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
