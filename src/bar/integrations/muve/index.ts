import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveMuveTitle = (): string | null => {
    const productHeading = document.querySelector('main h1, h1') as HTMLHeadingElement | null;
    return normalizeText(productHeading?.textContent);
};

export const muvePageRules: DomainPageRule[] = [
    {
        domain: 'muve.pl',
        resolveTitle: resolveMuveTitle,
        resolveRequestUrl: () => window.location.href,
        titleResolveRetryMs: 3000,
    },
    {
        domain: 'muve.games',
        resolveTitle: resolveMuveTitle,
        resolveRequestUrl: () => window.location.href,
        titleResolveRetryMs: 3000,
    },
];
