import type { DomainPageRule } from '../types';

export const resolveBattleNetTitle = (): string | null => {
    const heading = document.querySelector('h1') as HTMLHeadingElement | null;
    const title = heading?.textContent?.trim();
    return title && title.length > 0 ? title : null;
};

export const battleNetPageRule: DomainPageRule = {
    domain: 'battle.net',
    resolveTitle: resolveBattleNetTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 3000,
};
