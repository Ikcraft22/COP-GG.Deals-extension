import type { DomainPageRule } from '../types';

type MetacriticSourcePlatform = 'pc' | 'nintendo' | 'xbox' | 'playstation';

function resolveMetacriticTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
}

export function resolveMetacriticSourcePlatform(
    value: string = window.location.href,
): MetacriticSourcePlatform | null {
    try {
        const url = new URL(value, window.location.href);
        const platform = url.searchParams.get('platform')?.trim().toLowerCase();

        if (platform === 'pc') {
            return 'pc';
        }

        if (platform?.startsWith('nintendo-')) {
            return 'nintendo';
        }

        if (platform?.startsWith('xbox-')) {
            return 'xbox';
        }

        if (platform?.startsWith('playstation-')) {
            return 'playstation';
        }

        return null;
    } catch {
        return null;
    }
}

export const metacriticPageRule: DomainPageRule = {
    domain: 'metacritic.com',
    resolveTitle: resolveMetacriticTitle,
    resolveRequestUrl: () => window.location.href,
    resolveSourcePlatform: resolveMetacriticSourcePlatform,
    titleResolveRetryMs: 5000,
};
