export interface WebsiteItem {
    value: string;
    label: string;
}

export function toWebsiteItems(domains: string[]): WebsiteItem[] {
    return domains.map((domain) => ({
        value: domain,
        label: domain
    }));
}