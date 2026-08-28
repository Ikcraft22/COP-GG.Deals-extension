import type { DomainPageRule } from '../types';

const PLANETPLAY_PRODUCT_H1_SELECTOR = 'main h1.notranslate.line-clamp-3.max-w-\\[693px\\]';
const PLANETPLAY_FALLBACK_H1_SELECTOR = 'h1.notranslate.line-clamp-3';

function normalizeText(value: string | null | undefined): string | null {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export const resolvePlanetplayTitleFromH1 = (): string | null => {
	// Product title lives in a specific styled H1 - avoid generic `h1` because the page has many!!
	const productTitle = document.querySelector(PLANETPLAY_PRODUCT_H1_SELECTOR) as HTMLHeadingElement | null;
	if (productTitle) {
		return normalizeText(productTitle.textContent);
	}

	const fallbackTitle = document.querySelector(PLANETPLAY_FALLBACK_H1_SELECTOR) as HTMLHeadingElement | null;
	return normalizeText(fallbackTitle?.textContent);
};

export const resolvePlanetplayMetaTitle = (): string | null => {
	const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
	const ogValue = normalizeText(ogTitle?.content);
	if (ogValue) {
		return ogValue;
	}

	return normalizeText(document.title);
};

export const resolvePlanetplayTitle = (): string | null => {
	return resolvePlanetplayTitleFromH1() ?? resolvePlanetplayMetaTitle();
};

export const planetplayPageRule: DomainPageRule = {
	domain: 'planetplay.com',
	resolveTitle: resolvePlanetplayTitle,
	resolveRequestUrl: () => window.location.href,
	titleResolveRetryMs: 3000,
};
