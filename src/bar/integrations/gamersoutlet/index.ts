import type { DomainPageRule } from '../types';

export const resolveGamersOutletTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
};

export const gamersOutletPageRule: DomainPageRule = {
    domain: 'gamers-outlet.net',
    resolveTitle: resolveGamersOutletTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
