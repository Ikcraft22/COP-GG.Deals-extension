import type { DomainPageEligibility, DomainPageRule } from '../types';

const NINTENDO_SUPPORTED_SYSTEM_TYPES = new Set([
    'nintendoswitch_digitaldistribution',
    'nintendoswitch2',
]);

type NintendoNsuidEntry = {
    nsuid: string;
    systemType: string | null;
};

type NintendoInlinePageData = {
    nsuidEntries: NintendoNsuidEntry[];
    isPhysical: boolean;
};

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

    const nsuid = extractNintendoNextDataNsuid(nextDataMatch[1].trim());
    if (!nsuid) {
        throw new Error('Nintendo Game card: product nsuid not found');
    }

    return nsuid;
}

function extractNintendoNextDataNsuid(rawPayload: string): string | null {
    if (!rawPayload) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawPayload);
    } catch {
        return null;
    }

    const nsuid = (parsed as { props?: { pageProps?: { analytics?: { product?: { nsuid?: unknown } } } } })
        ?.props?.pageProps?.analytics?.product?.nsuid;
    if (typeof nsuid !== 'string' || nsuid.trim().length === 0) {
        return null;
    }

    return nsuid.trim();
}

function getNintendoNSUIDFromNextDataScript(): string | null {
    const script = document.querySelector<HTMLScriptElement>('script#__NEXT_DATA__');
    const rawPayload = script?.textContent?.trim();
    return rawPayload ? extractNintendoNextDataNsuid(rawPayload) : null;
}

function getNintendoInlinePageData(): NintendoInlinePageData {
    const nsuidEntries: NintendoNsuidEntry[] = [];
    let isPhysical = false;

    for (const script of Array.from(document.scripts)) {
        const text = script.textContent;
        if (!text) {
            continue;
        }

        if (/["']?isPhysical["']?\s*:\s*true\b/.test(text)) {
            isPhysical = true;
        }

        if (!/nsuids\s*=\s*\[/.test(text)) {
            continue;
        }

        const arrayStartMatch = text.match(/nsuids\s*=\s*\[/);
        const arrayStart = arrayStartMatch ? (arrayStartMatch.index ?? 0) + arrayStartMatch[0].length : 0;
        const arrayEndCandidate = text.indexOf('];', arrayStart);
        const arrayEnd = arrayEndCandidate === -1 ? text.length : arrayEndCandidate;
        const nsuidsArrayText = text.slice(arrayStart, arrayEnd);

        const nsuidPattern = /nsuid\s*:\s*["'](\d+)["']/g;
        const nsuidMatches = Array.from(nsuidsArrayText.matchAll(nsuidPattern));

        for (const [index, match] of nsuidMatches.entries()) {
            const entryStart = (match.index ?? 0) + match[0].length;
            const entryEnd = index + 1 < nsuidMatches.length
                ? nsuidMatches[index + 1].index ?? nsuidsArrayText.length
                : nsuidsArrayText.length;
            const entryText = nsuidsArrayText.slice(entryStart, entryEnd);
            const systemType = entryText.match(/systemType\s*:\s*["']([a-z0-9_-]+)["']/i)?.[1] ?? null;

            nsuidEntries.push({ nsuid: match[1], systemType });
        }
    }

    return { nsuidEntries, isPhysical };
}

function getNintendoNSUIDFromInlinePageData(inlinePageData: NintendoInlinePageData): string | null {
    if (inlinePageData.isPhysical) {
        return null;
    }

    const supportedSystemEntry = inlinePageData.nsuidEntries
        .find((entry) => entry.systemType !== null && NINTENDO_SUPPORTED_SYSTEM_TYPES.has(entry.systemType));

    return supportedSystemEntry?.nsuid ?? null;
}

export const resolveNintendoPageEligibility = (): DomainPageEligibility => {
    const { isPhysical, nsuidEntries } = getNintendoInlinePageData();

    if (isPhysical) {
        return {
            status: 'ineligible',
            reason: 'physical product confirmed by Nintendo isPhysical flag',
        };
    }

    if (nsuidEntries.length === 0) {
        if (window.location.hostname === 'ec.nintendo.com') {
            return {
                status: 'eligible',
                reason: 'eShop title page resolves the nsuid from the URL',
            };
        }

        // Store product pages (e.g. /us/store/products/...) do not render the
        // inline nsuids array, but expose the nsuid via the __NEXT_DATA__ payload
        if (getNintendoNSUIDFromNextDataScript()) {
            return {
                status: 'eligible',
                reason: 'store product page resolves the nsuid from __NEXT_DATA__',
            };
        }

        return {
            status: 'unknown',
            reason: 'inline nsuids array and __NEXT_DATA__ nsuid not found (page may still be hydrating)',
        };
    }

    if (nsuidEntries.some((entry) => entry.systemType !== null && NINTENDO_SUPPORTED_SYSTEM_TYPES.has(entry.systemType))) {
        return {
            status: 'eligible',
            reason: 'product page has a supported Nintendo Switch nsuid entry',
        };
    }

    return {
        status: 'ineligible',
        reason: 'no nsuids entry with a supported Nintendo Switch systemType',
        evidence: nsuidEntries.map((entry) => `${entry.nsuid}: ${entry.systemType ?? '<missing>'}`),
    };
};

async function createNintendoUrl(url: string): Promise<string | null> {
    const urlObject = new URL(url);
    const inlinePageData = getNintendoInlinePageData();
    const nsuidFromInlinePageData = getNintendoNSUIDFromInlinePageData(inlinePageData);
    const nsuidFromUrl = urlObject.searchParams.get('nsuid')?.trim();
    const eShopTitleMatch = urlObject.pathname.match(/^\/[a-z]{2}\/[a-z]{2}\/titles\/([^/]+)/i);

    if (nsuidFromInlinePageData) {
        return `https://ec.nintendo.com/titles/${nsuidFromInlinePageData}`;
    }

    // Inline product data confirms this is unsupported or physical. Skip
    // __NEXT_DATA__ fallbacks
    if (inlinePageData.isPhysical || inlinePageData.nsuidEntries.length > 0) {
        return null;
    }

    if (nsuidFromUrl) {
        return `https://ec.nintendo.com/titles/${nsuidFromUrl}`;
    }

    if (urlObject.hostname === 'ec.nintendo.com' && eShopTitleMatch?.[1]) {
        return `https://ec.nintendo.com/titles/${eShopTitleMatch[1]}`;
    }

    const nsuidFromNextDataScript = getNintendoNSUIDFromNextDataScript();
    if (nsuidFromNextDataScript) {
        return `https://ec.nintendo.com/titles/${nsuidFromNextDataScript}`;
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
    resolvePageEligibility: resolveNintendoPageEligibility,
    eligibilityResolveRetryMs: 5000,
    resolveTitle: resolveNintendoTitle,
    resolveRequestUrl: () => createNintendoUrl(window.location.href),
    titleResolveRetryMs: 7000,
};
