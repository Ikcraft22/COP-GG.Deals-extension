import type { DomainPageRule } from '../types';

const STORE_URL_LIMIT = 5;
const EXPECTED_STORE_URL_COUNT = 2;
const STORE_URL_RESOLVE_TIMEOUT_MS = 3000;
const STORE_URL_POLL_INTERVAL_MS = 100;

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveHowLongToBeatTitle = (): string | null => {
    const gameHeader = document.querySelector<HTMLElement>('div[class*="profile_header_game"]');
    const title = gameHeader?.querySelector<HTMLElement>(':scope > div[class*="profile_header"]');

    return normalizeText(title?.textContent);
};

function normalizeStoreUrl(value: string): string | null {
    try {
        const url = new URL(value, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const isSteamAppUrl = hostname === 'store.steampowered.com'
            && /^\/app\/\d+(?:\/|$)/i.test(url.pathname);
        const isGogGameUrl = (hostname === 'gog.com' || hostname.endsWith('.gog.com'))
            && /\/game\//i.test(url.pathname);

        if (!isSteamAppUrl && !isGogGameUrl) {
            return null;
        }

        url.hash = '';
        return url.href;
    } catch {
        return null;
    }
}

function resolveStoreUrlFromLink(link: HTMLAnchorElement): string | null {
    const href = normalizeText(link.getAttribute('href'));
    if (!href) {
        return null;
    }

    const directStoreUrl = normalizeStoreUrl(href);
    if (directStoreUrl) {
        return directStoreUrl;
    }

    try {
        const trackingUrl = new URL(href, window.location.href);
        const nestedStoreUrl = trackingUrl.searchParams.get('url');
        return nestedStoreUrl ? normalizeStoreUrl(nestedStoreUrl) : null;
    } catch {
        return null;
    }
}

function collectHowLongToBeatRequestUrls(): string[] {
    const storeLinks = document.querySelectorAll<HTMLAnchorElement>('a[href]');
    const requestUrls = Array.from(storeLinks)
        .map((link) => resolveStoreUrlFromLink(link))
        .filter((requestUrl): requestUrl is string => requestUrl !== null);

    return [...new Set(requestUrls)].slice(0, STORE_URL_LIMIT);
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

export const resolveHowLongToBeatRequestUrls = async (): Promise<string[]> => {
    const startedAt = Date.now();
    let requestUrls = collectHowLongToBeatRequestUrls();

    while (
        requestUrls.length < EXPECTED_STORE_URL_COUNT
        && Date.now() - startedAt < STORE_URL_RESOLVE_TIMEOUT_MS
    ) {
        await sleep(STORE_URL_POLL_INTERVAL_MS);
        requestUrls = collectHowLongToBeatRequestUrls();
    }

    return requestUrls;
};

export const howLongToBeatPageRule: DomainPageRule = {
    domain: 'howlongtobeat.com',
    resolveTitle: resolveHowLongToBeatTitle,
    resolveRequestUrls: resolveHowLongToBeatRequestUrls,
    titleResolveRetryMs: 5000,
};
