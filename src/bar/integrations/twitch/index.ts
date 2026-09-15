import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function resolveTwitchTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    return normalizeText(heading?.textContent);
}

function normalizeIgdbUrl(value: string | null): string | null {
    if (!value) {
        return null;
    }

    try {
        const url = new URL(value, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const isIgdbUrl = hostname === 'igdb.com' || hostname.endsWith('.igdb.com');

        if (!isIgdbUrl) {
            return null;
        }

        url.hash = '';
        return url.href;
    } catch {
        return null;
    }
}

function findIgdbLink(): string | null {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="igdb.com"]');

    for (const link of links) {
        const igdbUrl = normalizeIgdbUrl(link.getAttribute('href'));
        if (igdbUrl) {
            return igdbUrl;
        }
    }

    return null;
}

export function resolveTwitchRequestUrl(): string {
    return findIgdbLink() ?? window.location.href;
}

export const twitchPageRule: DomainPageRule = {
    domain: 'twitch.tv',
    resolveTitle: resolveTwitchTitle,
    resolveRequestUrl: resolveTwitchRequestUrl,
    titleResolveRetryMs: 5000,
};
