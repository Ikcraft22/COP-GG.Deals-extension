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
        const appId = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/i)?.[1];

        if (hostname !== 'steamdb.info' || !appId) {
            return null;
        }

        return `https://store.steampowered.com/app/${appId}/`;
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
