import type { DomainPageRule } from '../types';

export const getH1Title = (): string | null => {
    const h1Title: Element = document.querySelector('h1') as Element;
    return h1Title?.textContent?.trim() ?? null;
};

export const getMetaTitle = (): string | null => {
    const metaOgTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    const metaTitle = metaOgTitle?.content?.trim();
    if (metaTitle && metaTitle.length > 0) {
        return metaTitle;
    }

    const documentTitle = document.title?.trim();
    return documentTitle && documentTitle.length > 0 ? documentTitle : null;
};

export const resolveEnebaTitle = (): string | null => {
    return getH1Title() ?? getMetaTitle();
};

export const enebaPageRule: DomainPageRule = {
    domain: 'eneba.com',
    resolveTitle: resolveEnebaTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};