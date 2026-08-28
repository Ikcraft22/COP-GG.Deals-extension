import type { DomainPageRule } from '../types';

export const resolveSteamTitle = (): string | null => {
    const appName = document.querySelector('#appHubAppName') as HTMLElement | null;
    const title = appName?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const resolveSteamRequestUrl = (): string => {
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    return canonicalLink?.href || window.location.href;
};

export const steamPageRule: DomainPageRule = {
    domain: 'store.steampowered.com',
    resolveTitle: resolveSteamTitle,
    resolveRequestUrl: resolveSteamRequestUrl,
    titleResolveRetryMs: 3000,
};
