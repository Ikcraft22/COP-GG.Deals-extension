import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveReleasesTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h1.RWP-Product-MainInfoView-Name')
        ?? document.querySelector<HTMLHeadingElement>('h1');

    return normalizeText(heading?.textContent);
};

export const resolveReleasesRequestUrl = (): string | null => {
    const steamLink = document.querySelector<HTMLAnchorElement>(
        '.RWP-Product-MainInfoView-LinksPanel a[href*="store.steampowered.com/app/"]',
    ) ?? document.querySelector<HTMLAnchorElement>('a[href*="store.steampowered.com/app/"]');
    const href = normalizeText(steamLink?.getAttribute('href'));
    if (!href) {
        return null;
    }

    try {
        const url = new URL(href, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const isSteamAppUrl = /^\/app\/\d+(?:\/|$)/i.test(url.pathname);

        return hostname === 'store.steampowered.com' && isSteamAppUrl ? url.href : null;
    } catch {
        return null;
    }
};

export const resolveReleasesRequestUrls = (): string[] => {
    const steamUrl = resolveReleasesRequestUrl();
    return steamUrl ? [steamUrl] : [];
};

export const releasesPageRule: DomainPageRule = {
    domain: 'releases.com',
    resolveTitle: resolveReleasesTitle,
    resolveRequestUrls: resolveReleasesRequestUrls,
    requestUrlsResolveRetryMs: 3000,
    titleResolveRetryMs: 5000,
};
