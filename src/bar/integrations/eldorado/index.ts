import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveEldoradoTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(heading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    return normalizeText(ogTitle?.content) ?? normalizeText(document.title);
};

export const createEldoradoRequestUrl = (url: string): string => {
    const requestUrl = new URL(url);
    const variantParams = [...requestUrl.searchParams.entries()].filter(([key]) => /^te_v\d+$/i.test(key));

    requestUrl.search = '';
    for (const [key, value] of variantParams) {
        requestUrl.searchParams.append(key, value);
    }

    return requestUrl.href;
};

export const eldoradoPageRule: DomainPageRule = {
    domain: 'eldorado.gg',
    resolveTitle: resolveEldoradoTitle,
    resolveRequestUrl: () => createEldoradoRequestUrl(window.location.href),
    titleResolveRetryMs: 3000,
};
