function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveIsThereAnyDealTitle(): string | null {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    return normalizeText(heading?.textContent);
}

function resolveIsThereAnyDealRequestUrl(): string | null {
    const steamDbLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="steamdb.info/"]');

    for (const link of steamDbLinks) {
        try {
            const url = new URL(link.href, window.location.href);
            const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

            if (hostname !== 'steamdb.info') {
                continue;
            }

            const appIdMatch = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/i);
            const appId = appIdMatch?.[1];
            if (!appId) {
                continue;
            }

            const steamStoreUrl = `https://store.steampowered.com/app/${appId}/`;
            console.log('[gg.deals-extension] IsThereAnyDeal Steam App ID:', appId);
            console.log('[gg.deals-extension] IsThereAnyDeal request URL:', steamStoreUrl);
            return steamStoreUrl;
        } catch {
            // Ignore malformed links and keep looking for the SteamDB URL.
        }
    }

    console.warn('[gg.deals-extension] IsThereAnyDeal Steam App ID not found, using current page URL');
    return window.location.href;
}

export const isThereAnyDealPageRule = {
    domain: 'isthereanydeal.com',
    resolveTitle: resolveIsThereAnyDealTitle,
    resolveRequestUrl: resolveIsThereAnyDealRequestUrl,
    titleResolveRetryMs: 3000,
}
