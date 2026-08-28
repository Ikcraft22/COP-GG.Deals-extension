import type { DomainPageEligibility, DomainPageRule } from '../types';

const DIGITAL_PRODUCT_ICON_SELECTOR = 'i.fas.fa-bolt';
const PHYSICAL_PRODUCT_ICON_SELECTOR = 'i.fa-solid.fa-plane';

function normalizeText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : null;
}

export const resolvePlayAsiaTitle = (): string | null => {
    const heading = document.querySelector(
        'h1.p_name.pa-modern-h3[itemprop="name"]',
    ) as HTMLHeadingElement | null;
    return normalizeText(heading?.textContent);
};

export const resolvePlayAsiaPageEligibility = (): DomainPageEligibility => {
    const physicalProductIcon = document.querySelector<HTMLElement>(PHYSICAL_PRODUCT_ICON_SELECTOR);

    if (physicalProductIcon) {
        return {
            status: 'ineligible',
            reason: 'physical product confirmed by PlayAsia delivery icon',
            evidence: [PHYSICAL_PRODUCT_ICON_SELECTOR],
        };
    }

    const digitalProductIcon = document.querySelector<HTMLElement>(DIGITAL_PRODUCT_ICON_SELECTOR);

    if (digitalProductIcon) {
        return {
            status: 'eligible',
            reason: 'digital product confirmed by PlayAsia instant delivery icon',
            evidence: [DIGITAL_PRODUCT_ICON_SELECTOR],
        };
    }

    return {
        status: 'unknown',
        reason: 'PlayAsia digital or physical product icon was not found',
    };
};

export const playAsiaPageRule: DomainPageRule = {
    domain: 'play-asia.com',
    resolvePageEligibility: resolvePlayAsiaPageEligibility,
    resolveTitle: resolvePlayAsiaTitle,
    resolveRequestUrl: () => window.location.href,
    eligibilityResolveRetryMs: 5000,
    titleResolveRetryMs: 3000,
};
