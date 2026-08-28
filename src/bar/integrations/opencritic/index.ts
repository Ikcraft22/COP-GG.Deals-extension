import type { DomainPageRule } from '../types';

function resolveOpenCriticTitle(): string | null {
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    const title = heading?.textContent?.trim();

    return title && title.length > 0 ? title : null;
}

export const openCriticPageRule: DomainPageRule = {
    domain: 'opencritic.com',
    resolveTitle: resolveOpenCriticTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 5000,
};
