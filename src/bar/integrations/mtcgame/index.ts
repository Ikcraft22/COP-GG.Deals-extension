import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveMtcgameTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    return normalizeText(heading?.textContent);
};

export const mtcgamePageRule: DomainPageRule = {
    domain: 'mtcgame.com',
    resolveTitle: resolveMtcgameTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 5000,
};
