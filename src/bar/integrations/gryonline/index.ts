import type { DomainPageRule } from '../types';

function resolveGryOnlineTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
}

function normalizeGryOnlineExternalUrl(value: string | null): string | null {
    if (!value) {
        return null;
    }

    try {
        const url = new URL(value, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const isSteamAppUrl = hostname === 'store.steampowered.com'
            && /^\/app\/\d+(?:\/|$)/i.test(url.pathname);
        const isOpenCriticGameUrl = hostname === 'opencritic.com'
            && /^\/game\/\d+(?:\/|$)/i.test(url.pathname);

        if (!isSteamAppUrl && !isOpenCriticGameUrl) {
            return null;
        }

        url.hash = '';
        return url.href;
    } catch {
        return null;
    }
}

export function resolveGryOnlineRequestUrls(): string[] {
    const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="store.steampowered.com/app/"], a[href*="opencritic.com/game/"]',
    );
    const requestUrls = Array.from(links)
        .map((link) => normalizeGryOnlineExternalUrl(link.getAttribute('href')))
        .filter((requestUrl): requestUrl is string => requestUrl !== null);

    return [...new Set(requestUrls)];
}

export const gryOnlinePageRule: DomainPageRule = {
    domain: 'gry-online.pl',
    resolveTitle: resolveGryOnlineTitle,
    resolveRequestUrls: resolveGryOnlineRequestUrls,
    requestUrlsResolveRetryMs: 3000,
    requestUrlsExpectedCount: 2,
    titleResolveRetryMs: 5000,
};
