import type { DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export const resolveGamivoTitle = (): string | null => {
	const titleFromSpecificHeading = document.querySelector('h1.title') as HTMLHeadingElement | null;
	return normalizeText(titleFromSpecificHeading?.textContent);
};

export const gamivoPageRule: DomainPageRule = {
	domain: 'gamivo.com',
	resolveTitle: resolveGamivoTitle,
	resolveRequestUrl: () => window.location.href,
	titleResolveRetryMs: 3000,
};
