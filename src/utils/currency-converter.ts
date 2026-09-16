import type { Region } from './extension-settings';

const COP_CURRENCY = 'COP';
const RATES_API_URL = 'https://open.er-api.com/v6/latest';
const RATE_CACHE_TTL_MS = 60 * 60 * 1000;

const REGION_CURRENCIES: Record<Region, string> = {
    au: 'AUD',
    be: 'EUR',
    br: 'BRL',
    ca: 'CAD',
    dk: 'DKK',
    eu: 'EUR',
    fi: 'EUR',
    fr: 'EUR',
    de: 'EUR',
    ie: 'EUR',
    it: 'EUR',
    nl: 'EUR',
    no: 'NOK',
    pl: 'PLN',
    es: 'EUR',
    se: 'SEK',
    ch: 'CHF',
    gb: 'GBP',
    us: 'USD',
};

type CachedRate = {
    value: number;
    expiresAt: number;
};

type RatesResponse = {
    result?: string;
    rates?: Record<string, number>;
};

const rateCache = new Map<string, CachedRate>();

function parsePrice(value: string): number | null {
    const normalized = value
        .replace(/\u00a0/g, ' ')
        .replace(/[^0-9,.-]/g, '')
        .replace(/(?!^)-/g, '');

    if (!normalized || !/[0-9]/.test(normalized)) {
        return null;
    }

    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    let numericValue = normalized;

    if (lastComma >= 0 && lastDot >= 0) {
        const decimalSeparator = lastComma > lastDot ? ',' : '.';
        const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
        numericValue = normalized.replaceAll(thousandsSeparator, '').replace(decimalSeparator, '.');
    } else if (lastComma >= 0) {
        numericValue = normalized.replace(',', '.');
    }

    const parsed = Number(numericValue);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function getRateToCop(currency: string): Promise<number> {
    if (currency === COP_CURRENCY) {
        return 1;
    }

    const cachedRate = rateCache.get(currency);
    if (cachedRate && cachedRate.expiresAt > Date.now()) {
        return cachedRate.value;
    }

    const url = new URL(`${RATES_API_URL}/${currency}`);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Currency rate request failed: HTTP ${response.status}`);
    }

    const data = await response.json() as RatesResponse;
    const rate = data.rates?.[COP_CURRENCY];
    if (data.result !== 'success' || typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error(`Currency rate response did not contain ${currency}/${COP_CURRENCY}`);
    }

    rateCache.set(currency, { value: rate, expiresAt: Date.now() + RATE_CACHE_TTL_MS });
    return rate;
}

export async function convertPriceToCop(price: string, region: Region): Promise<string | null> {
    const numericPrice = parsePrice(price);
    const currency = REGION_CURRENCIES[region];
    if (numericPrice === null || !currency) {
        return null;
    }

    const copValue = numericPrice * await getRateToCop(currency);
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: COP_CURRENCY,
        currencyDisplay: 'code',
        maximumFractionDigits: 0,
    }).format(copValue);
}