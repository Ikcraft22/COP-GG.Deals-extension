import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function extractTitleFromProductPath(pathname: string): string | null {
    const match = pathname.match(/^\/[a-z]{2}\/p-\d+\/\d+-([^/?#]+)/i);
    if (!match?.[1]) {
        return null;
    }

    const normalized = match[1].replace(/[-_]+/g, ' ').trim();
    return normalized.length > 0 ? normalized : null;
}

export const resolvePlayerlandTitle = (): string | null => {
    const titleFromHeading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(titleFromHeading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    return extractTitleFromProductPath(window.location.pathname);
};

export const playerlandPageRule: DomainPageRule = {
    domain: 'player.land',
    resolveTitle: resolvePlayerlandTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 7000,
};
