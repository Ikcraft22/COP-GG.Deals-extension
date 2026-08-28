import type { DomainPageRule } from '../types';

function resolveEgDataTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
}

export const egDataPageRule: DomainPageRule = {
    domain: 'egdata.app',
    resolveTitle: resolveEgDataTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 5000,
};
