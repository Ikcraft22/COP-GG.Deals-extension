import type { DomainPageRule } from '../types';

type IgdbShop = 'steam' | 'epic' | 'gog' | 'xbox' | 'playstation' | 'nintendo';

const IGDB_SHOP_ICON_PATTERN = /\/icons\/(steam|epic|gog|xbox|playstation|nintendo)\.(?:svg|png)$/i;

function resolveIgdbTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
}

function resolveIgdbShop(link: HTMLAnchorElement): IgdbShop | null {
    const icon = link.querySelector<HTMLImageElement>('img[src]');
    const iconSrc = icon?.getAttribute('src') ?? '';
    const shop = iconSrc.match(IGDB_SHOP_ICON_PATTERN)?.[1]?.toLowerCase();

    if (
        shop === 'steam'
        || shop === 'epic'
        || shop === 'gog'
        || shop === 'xbox'
        || shop === 'playstation'
        || shop === 'nintendo'
    ) {
        return shop;
    }

    return null;
}

function isExpectedShopHostname(shop: IgdbShop, hostname: string): boolean {
    switch (shop) {
        case 'steam':
            return hostname === 'store.steampowered.com';
        case 'epic':
            return hostname === 'epicgames.com' || hostname.endsWith('.epicgames.com');
        case 'gog':
            return hostname === 'gog.com' || hostname.endsWith('.gog.com');
        case 'xbox':
            return hostname === 'xbox.com' || hostname.endsWith('.xbox.com');
        case 'playstation':
            return hostname === 'store.playstation.com';
        case 'nintendo':
            return hostname === 'nintendo.com' || hostname.endsWith('.nintendo.com');
    }
}

function normalizeIgdbShopUrl(value: string | null, shop: IgdbShop): string | null {
    if (!value) {
        return null;
    }

    try {
        const url = new URL(value, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const isHttpUrl = url.protocol === 'https:' || url.protocol === 'http:';

        if (!isHttpUrl || !isExpectedShopHostname(shop, hostname)) {
            return null;
        }

        url.hash = '';
        return url.href;
    } catch {
        return null;
    }
}

export function resolveIgdbRequestUrls(): string[] {
    const requestUrls = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map((link) => {
            const shop = resolveIgdbShop(link);
            return shop ? normalizeIgdbShopUrl(link.getAttribute('href'), shop) : null;
        })
        .filter((requestUrl): requestUrl is string => requestUrl !== null);

    return [...new Set(requestUrls)];
}

export const igdbPageRule: DomainPageRule = {
    domain: 'igdb.com',
    resolveTitle: resolveIgdbTitle,
    resolveRequestUrls: resolveIgdbRequestUrls,
    requestUrlsResolveRetryMs: 3000,
    titleResolveRetryMs: 5000,
};
