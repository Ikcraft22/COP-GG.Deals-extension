import type { DomainPageRule } from '../types';

async function fetchNintendoGameHtml(url: string): Promise<string> {
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });

    console.log('[gg.deals-extension] Fetching Nintendo HTML from: ', url);
    if (!response.ok) {
        throw new Error(`Nintendo page request failed (HTTP ${response.status})`);
    }

    return response.text();
}

async function getNintendoNSUIDFromNextData(url: string): Promise<string> {
    const html = await fetchNintendoGameHtml(url);
    const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);

    if (!nextDataMatch?.[1]) {
        throw new Error('Nintendo Game card: script#__NEXT_DATA__ not found');
    }

    const rawPayload = nextDataMatch[1].trim();
    if (!rawPayload) {
        throw new Error('Nintendo Game card: __NEXT_DATA__ is empty');
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawPayload);
    } catch (error) {
        throw new Error(`Failed to parse __NEXT_DATA__ JSON: ${error}`);
    }

    const nsuid = (parsed as { props?: { pageProps?: { analytics?: { product?: { nsuid?: unknown } } } } })
        ?.props?.pageProps?.analytics?.product?.nsuid;
    if (typeof nsuid !== 'string' || nsuid.trim().length === 0) {
        throw new Error('Nintendo Game card: product nsuid not found');
    }

    return nsuid;
}

function getNintendoNSUIDFromInlinePageData(): string | null {
    for (const script of Array.from(document.scripts)) {
        const text = script.textContent;
        if (!text || !text.includes('nsuid')) {
            continue;
        }

        const productTypeMatch = text.match(/(?:const|let|var)\s+na_product_type\s*=\s*\{[\s\S]*?["'](\d+)["']\s*:\s*["']gameFull["']/i);
        if (productTypeMatch?.[1]) {
            return productTypeMatch[1];
        }

        const nsuidObjectMatch = text.match(/nsuid\s*:\s*["'](\d+)["'][\s\S]*?productType\s*:\s*["']gameFull["']/i);
        if (nsuidObjectMatch?.[1]) {
            return nsuidObjectMatch[1];
        }
    }

    return null;
}

async function createNintendoUrl(url: string): Promise<string> {
    const urlObject = new URL(url);
    const nsuidFromInlinePageData = getNintendoNSUIDFromInlinePageData();
    const nsuidFromUrl = urlObject.searchParams.get('nsuid')?.trim();
    const eShopTitleMatch = urlObject.pathname.match(/^\/[a-z]{2}\/[a-z]{2}\/titles\/([^/]+)/i);

    if (nsuidFromInlinePageData) {
        return `https://ec.nintendo.com/titles/${nsuidFromInlinePageData}`;
    }

    if (nsuidFromUrl) {
        return `https://ec.nintendo.com/titles/${nsuidFromUrl}`;
    }

    if (urlObject.hostname === 'ec.nintendo.com' && eShopTitleMatch?.[1]) {
        return `https://ec.nintendo.com/titles/${eShopTitleMatch[1]}`;
    }

    const nsuid = await getNintendoNSUIDFromNextData(url);
    return `https://ec.nintendo.com/titles/${nsuid}`;
}

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value
        .replace(/™/g, '')
        .replace(/\bEdition\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveNintendoTitle = (): string | null => {
    const titleFromPrimaryHeading = document.querySelector('h1[data-testid="pdp-product-title"]') as HTMLHeadingElement | null;
    const primaryHeadingTitle = normalizeText(titleFromPrimaryHeading?.textContent);
    if (primaryHeadingTitle) {
        return primaryHeadingTitle;
    }

    const titleFromMainHeading = document.querySelector('main h1') as HTMLHeadingElement | null;
    const mainHeadingTitle = normalizeText(titleFromMainHeading?.textContent);
    if (mainHeadingTitle) {
        return mainHeadingTitle;
    }

    const titleFromHeading = document.querySelector('h1') as HTMLHeadingElement | null;
    const headingTitle = normalizeText(titleFromHeading?.textContent);
    if (headingTitle) {
        return headingTitle;
    }

    return normalizeText(document.title);
};

export const nintendoPageRule: DomainPageRule = {
    domain: 'nintendo.com',
    resolveTitle: resolveNintendoTitle,
    resolveRequestUrl: () => createNintendoUrl(window.location.href),
    titleResolveRetryMs: 7000,
};
