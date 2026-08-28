import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveBarterVgTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h1[itemprop="name"]')
        ?? document.querySelector<HTMLHeadingElement>('h1');

    return normalizeText(heading?.textContent);
};

export const resolveBarterVgRequestUrl = (): string | null => {
    const steamLink = document.querySelector<HTMLAnchorElement>('a[href*="store.steampowered.com/app/"]');
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

export const barterVgPageRule: DomainPageRule = {
    domain: 'barter.vg',
    resolveTitle: resolveBarterVgTitle,
    resolveRequestUrl: resolveBarterVgRequestUrl,
    titleResolveRetryMs: 3000,
};
