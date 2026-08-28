import type { DomainPageRule } from '../types';

export const resolveJoybuggyTitle = (): string | null => {
    const heading = document.querySelector('h1.jb-product-title[itemprop="name"]') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const joybuggyPageRule: DomainPageRule = {
    domain: 'joybuggy.com',
    resolveTitle: resolveJoybuggyTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
