import type { DomainPageRule } from '../types';

export const resolvePlaysumTitle = (): string | null => {
    const heading = document.querySelectorAll<HTMLHeadingElement>('h2')[1] ?? null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const playsumPageRule: DomainPageRule = {
    domain: 'store.playsum.live',
    resolveTitle: resolvePlaysumTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
