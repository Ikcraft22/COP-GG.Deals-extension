import type { DomainPageEligibility, DomainPageRule } from '../types';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export const resolveGameStopTitle = (): string | null => {
    const titleSelectors = [
        'h2.product-name',
        'h1.product-name',
        'h2[data-qa="product-name"]',
        'h1[data-qa="product-name"]',
        '[data-qa="product-name"] h2',
        '[data-qa="product-name"] h1',
        'h1',
    ];

    for (const selector of titleSelectors) {
        const heading = document.querySelector(selector) as HTMLElement | null;
        const headingTitle = normalizeText(heading?.textContent);
        if (headingTitle) {
            return headingTitle;
        }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    return normalizeText(ogTitle?.content);
};

export const resolveGameStopCondition = (): string | null => {
    const selectedCondition = document.querySelector<HTMLElement>(
        '[data-attr="condition"] .condition-attribute-card.selected[data-attr-value]',
    );
    return normalizeText(selectedCondition?.getAttribute('data-attr-value'));
};

export const resolveGameStopPageEligibility = (): DomainPageEligibility => {
    const conditionLabel = resolveGameStopCondition();
    const condition = conditionLabel?.toLowerCase();

    if (condition === 'digital') {
        return {
            status: 'eligible',
            reason: 'digital product confirmed by selected GameStop condition',
            evidence: ['condition=Digital'],
        };
    }

    if (condition === 'new' || condition === 'pre-owned') {
        return {
            status: 'ineligible',
            reason: 'physical product confirmed by selected GameStop condition',
            evidence: [`condition=${conditionLabel}`],
        };
    }

    return {
        status: 'unknown',
        reason: 'recognized GameStop product condition was not found',
        evidence: [`condition=${conditionLabel ?? '<missing>'}`],
    };
};

export const gameStopPageRule: DomainPageRule = {
    domain: 'gamestop.com',
    resolvePageEligibility: resolveGameStopPageEligibility,
    resolvePageStateKey: resolveGameStopCondition,
    resolveTitle: resolveGameStopTitle,
    resolveRequestUrl: () => window.location.href,
    eligibilityResolveRetryMs: 5000,
    titleResolveRetryMs: 3000,
};
