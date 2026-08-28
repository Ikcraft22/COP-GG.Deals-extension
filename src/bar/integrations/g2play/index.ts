import type { DomainPageRule } from '../types';

export const resolveG2playTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const g2playPageRule: DomainPageRule = {
    domain: 'g2play.net',
    resolveTitle: resolveG2playTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
