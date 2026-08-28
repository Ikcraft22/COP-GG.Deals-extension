import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveEpicTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(heading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    return normalizeText(ogTitle?.content);
};

export const epicPageRule: DomainPageRule = {
    domain: 'store.epicgames.com',
    resolveTitle: resolveEpicTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
