export type BottomBarTitleResolver = () => string | null;

export type BottomBarRequestUrlResolver = () => string | null | Promise<string | null>;

export type BottomBarRequestUrlsResolver = () => string[] | Promise<string[]>;

export type BottomBarSourcePlatformResolver = () => string | null;

export type BottomBarPageStateKeyResolver = () => string | null;

export type DomainPageEligibilityStatus = 'eligible' | 'ineligible' | 'unknown';

// Console logs, currently used by Amazon only, but can be used by other domains in the future
export type DomainPageEligibility = {
    status: DomainPageEligibilityStatus;
    reason: string;
    evidence?: string[];
};

export type DomainPageEligibilityResolver = () => DomainPageEligibility | Promise<DomainPageEligibility>;

export type DomainPageRule = {
    domain: string;
    resolvePageEligibility?: DomainPageEligibilityResolver;
    resolveTitle?: BottomBarTitleResolver;
    resolveRequestUrl?: BottomBarRequestUrlResolver;
    resolveRequestUrls?: BottomBarRequestUrlsResolver;
    resolveSourcePlatform?: BottomBarSourcePlatformResolver;
    resolvePageStateKey?: BottomBarPageStateKeyResolver;
    requestUrlsResolveRetryMs?: number;
    requestUrlsExpectedCount?: number;
    eligibilityResolveRetryMs?: number;
    titleResolveRetryMs?: number;
    omitSourceUrl?: boolean;
};

export type BarGameRequestPayload = {
    url: string;
    title: string | null;
    platform: string;
    showKeyshops: boolean;
    region: string;
    sourceUrl?: string;
    sourcePlatform: string | null;
};

export type BarGamesRequestPayload = {
    urls: string[];
    title: string;
    platform: string;
    showKeyshops: boolean;
    region: string;
    sourceUrl?: string;
    sourcePlatform: string | null;
};
