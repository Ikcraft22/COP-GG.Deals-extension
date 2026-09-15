import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveLowcygierBazarTitle = (): string | null => {
    const heading = document.querySelector<HTMLHeadingElement>('h2.test');
    if (!heading) {
        return null;
    }

    const titleHeading = heading.cloneNode(true) as HTMLHeadingElement;
    titleHeading.querySelectorAll('span').forEach((span) => {
        span.remove();
    });

    return normalizeText(titleHeading.textContent);
};

export const resolveLowcygierBazarRequestUrl = (): string | null => {
    const ggDealsLink = document.querySelector<HTMLAnchorElement>(
        'a[href*="gg.deals"] img[src*="gg.svg"]',
    );
    const href = normalizeText(ggDealsLink?.closest<HTMLAnchorElement>('a')?.getAttribute('href'));
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

export const lowcygierBazarPageRule: DomainPageRule = {
    domain: 'bazar.lowcygier.pl',
    resolveTitle: resolveLowcygierBazarTitle,
    resolveRequestUrl: resolveLowcygierBazarRequestUrl,
    titleResolveRetryMs: 3000,
};
