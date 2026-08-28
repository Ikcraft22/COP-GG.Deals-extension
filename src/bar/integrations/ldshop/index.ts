import type { DomainPageRule } from '../types';

const PRODUCT_PATH_PATTERN = /\/(?:card|top-up)\//i;

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function isLdShopProductPage(pathname: string): boolean {
    return PRODUCT_PATH_PATTERN.test(pathname);
}

function isGiftCardPage(): boolean {
    return document.querySelector('a[href="/catalog/gift-card"]') !== null;
}

export const resolveLdShopTitle = (): string | null => {
    const { pathname } = window.location;
    if (!isLdShopProductPage(pathname)) {
        return null;
    }

    const useParagraphTitle = /\/top-up\//i.test(pathname) || isGiftCardPage();
    const titleElement = document.querySelector(useParagraphTitle ? 'p' : 'h1');

    return normalizeText(titleElement?.textContent);
};

export const ldShopPageRule: DomainPageRule = {
    domain: 'ldshop.gg',
    resolveTitle: resolveLdShopTitle,
    resolveRequestUrl: () => window.location.href,
    titleResolveRetryMs: 7000,
};
