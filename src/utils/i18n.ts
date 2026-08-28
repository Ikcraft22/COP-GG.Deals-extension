import browser from 'webextension-polyfill';

export function t(messageName: string, substitutions?: string | string[]): string {
    return browser.i18n.getMessage(messageName, substitutions) || messageName;
}

export function getUiLanguage(): string {
    return browser.i18n.getUILanguage();
}
