import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveLestradesTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('#game-title')
        ?? document.querySelector<HTMLHeadingElement>('h1');
    if (!heading) {
        return null;
    }

    const titleHeading = heading.cloneNode(true) as HTMLHeadingElement;
    titleHeading.querySelectorAll('span').forEach((span) => {
        span.remove();
    });

    return normalizeText(titleHeading.textContent);
};

export const resolveLestradesRequestUrl = (): string | null => {
    const ggDealsLink = document.querySelector<HTMLAnchorElement>('#game-info a[href*="gg.deals"]');
    const href = normalizeText(ggDealsLink?.getAttribute('href'));
    if (!href) {
        return null;
    }

    try {
        const url = new URL(href, window.location.href);
        const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

        return hostname === 'gg.deals' ? url.href : null;
    } catch {
        return null;
    }
};

export const lestradesPageRule: DomainPageRule = {
    domain: 'lestrades.com',
    resolveTitle: resolveLestradesTitle,
    resolveRequestUrl: resolveLestradesRequestUrl,
    titleResolveRetryMs: 3000,
};
