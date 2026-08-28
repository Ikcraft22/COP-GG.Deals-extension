import type { DomainPageRule } from '../types';

export const resolveKinguinTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
};

export const kinguinPageRule: DomainPageRule = {
    domain: 'kinguin.net',
    resolveTitle: resolveKinguinTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
