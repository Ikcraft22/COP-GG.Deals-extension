import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveSteamDbTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h1[itemprop="name"]')
        ?? document.querySelector<HTMLHeadingElement>('h1');

    return normalizeText(heading?.textContent);
};

export const resolveSteamDbRequestUrl = (): string | null => {
    try {
        const url = new URL(window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const productMatch = url.pathname.match(/^\/(app|sub|bundle)\/(\d+)(?:\/|$)/i);

        if (hostname !== 'steamdb.info' || !productMatch) {
            return null;
        }

        const productType = productMatch[1];
        const productId = productMatch[2];
        return `https://store.steampowered.com/${productType.toLowerCase()}/${productId}/`;
    } catch {
        return null;
    }
};

export const steamDbPageRule: DomainPageRule = {
    domain: 'steamdb.info',
    resolveTitle: resolveSteamDbTitle,
    resolveRequestUrl: resolveSteamDbRequestUrl,
    titleResolveRetryMs: 3000,
};
