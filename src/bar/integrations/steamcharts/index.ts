import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveSteamChartsTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('#app-title')
        ?? document.querySelector<HTMLHeadingElement>('h1');

    return normalizeText(heading?.textContent);
};

export const resolveSteamChartsRequestUrl = (): string | null => {
    try {
        const url = new URL(window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        const appId = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/i)?.[1];

        if (hostname !== 'steamcharts.com' || !appId) {
            return null;
        }

        return `https://store.steampowered.com/app/${appId}/`;
    } catch {
        return null;
    }
};

export const steamChartsPageRule: DomainPageRule = {
    domain: 'steamcharts.com',
    resolveTitle: resolveSteamChartsTitle,
    resolveRequestUrl: resolveSteamChartsRequestUrl,
    titleResolveRetryMs: 3000,
};
