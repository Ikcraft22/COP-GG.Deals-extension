import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveTwoGameTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = normalizeText(heading?.textContent);
    if (!title) {
        return null;
    }

    const description = normalizeText(
        heading?.closest('.title__content')?.querySelector('.title__product__description')?.textContent,
    );

    return description ? `${title}: ${description}` : title;
};

export const twoGamePageRule: DomainPageRule = {
    domain: '2game.com',
    resolveTitle: resolveTwoGameTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
