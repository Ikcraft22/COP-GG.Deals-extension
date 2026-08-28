import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveRockstarTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    return normalizeText(heading?.textContent);
};

export const rockstarPageRule: DomainPageRule = {
    domain: 'store.rockstargames.com',
    resolveTitle: resolveRockstarTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 5000,
};
