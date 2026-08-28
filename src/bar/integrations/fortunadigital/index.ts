import type { DomainPageRule } from '../types';

export const resolveFortunaDigitalTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const fortunaDigitalPageRule: DomainPageRule = {
    domain: 'fortunadigital.net',
    resolveTitle: resolveFortunaDigitalTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
