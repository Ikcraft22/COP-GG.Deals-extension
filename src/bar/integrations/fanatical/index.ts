import type { DomainPageRule } from '../types';

export const getH1Title = (): string | null => {
    const h1Title: Element = document.querySelector('.product-name') as Element;
    return h1Title?.textContent?.trim() ?? null;
};

export const fanaticalPageRule: DomainPageRule = {
    domain: 'fanatical.com',
    resolveTitle: getH1Title,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000, // Retry every 3 seconds as Fanatical might have some SPA navigation issues
}