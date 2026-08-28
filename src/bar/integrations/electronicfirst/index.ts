import type { DomainPageRule } from '../types';

export const resolveElectronicFirstTitle = (): string | null => {
    const title = document.querySelector<HTMLHeadingElement>('h1')?.textContent?.trim();
    return title || null;
};

export const electronicFirstPageRule: DomainPageRule = {
    domain: 'electronicfirst.com',
    resolveTitle: resolveElectronicFirstTitle,
    resolveRequestUrl: () => window.location.href,
    // The integration is fail-closed when no H1 appears. Allow time for a
    // client-rendered product heading before rejecting the page.
    titleResolveRetryMs: 5000,
};
