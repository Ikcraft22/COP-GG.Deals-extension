import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function titleFromGameboostPath(pathname: string): string | null {
    const normalizedPath = pathname.replace(/\/+$/, '');
    const slug = normalizedPath.split('/').filter(Boolean).pop();
    if (!slug || slug.length === 0) {
        return null;
    }

    const withoutNumericSuffix = slug.replace(/-00-\d+$/i, '');
    if (!withoutNumericSuffix) {
        return null;
    }

    return normalizeText(withoutNumericSuffix.replace(/-/g, ' '));
}

export const resolveGameboostTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(heading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    const ogTitleValue = normalizeText(ogTitle?.content);
    if (ogTitleValue) {
        return ogTitleValue;
    }

    const pathTitle = titleFromGameboostPath(window.location.pathname);
    if (pathTitle) {
        return pathTitle;
    }

    return normalizeText(document.title);
};

export const gameboostPageRule: DomainPageRule = {
    domain: 'gameboost.com',
    resolveTitle: resolveGameboostTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
