import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveKeycenseTitle = (): string | null => {
    const titleFromMuiHeading = document.querySelector('h1.MuiTypography-root.MuiTypography-h2') as HTMLHeadingElement | null;
    const muiTitle = normalizeText(titleFromMuiHeading?.textContent);
    if (muiTitle) {
        return muiTitle;
    }

    const titleFromHeading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(titleFromHeading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    const ogTitleValue = normalizeText(ogTitle?.content);
    if (ogTitleValue) {
        return ogTitleValue;
    }

    return normalizeText(document.title);
};

export const keycensePageRule: DomainPageRule = {
    domain: 'keycense.com',
    resolveTitle: resolveKeycenseTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
