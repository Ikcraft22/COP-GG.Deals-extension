import type { DomainPageRule } from '../types';

export const resolveAllyouplayTitle = (): string | null => {
	const heading = document.querySelector('h1') as HTMLHeadingElement | null;
	const title = heading?.textContent?.trim();
	return title && title.length > 0 ? title : null;
};

export const allyouplayPageRule: DomainPageRule = {
	domain: 'allyouplay.com',
	resolveTitle: resolveAllyouplayTitle,
	resolveRequestUrl: () => window.location.href,
	titleResolveRetryMs: 3000,
};