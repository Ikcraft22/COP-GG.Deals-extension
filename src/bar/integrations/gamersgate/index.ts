import type { DomainPageRule } from '../types';

export const resolveGamersGateTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const gamersGatePageRule: DomainPageRule = {
    domain: 'gamersgate.com',
    resolveTitle: resolveGamersGateTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
