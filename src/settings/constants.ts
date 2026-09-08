export {
    APPEARANCE_STORAGE_KEY,
    EXCLUDED_WEBSITES_STORAGE_KEY,
    GG_API_INVALID_API_KEY_CODE,
    GG_USER_SETTINGS,
    SETTINGS_STORAGE_KEY
} from '../utils/extension-settings-constants';
export const SHOULD_FETCH_USER_SETTINGS_AFTER_SIGN_IN_KEY: string = 'shouldFetchUserSettingsAfterSignIn';
export const POPUP_INITIAL_TAB_STORAGE_KEY: string = 'popupInitialTab';
export const POPUP_LAST_ACTIVE_TAB_STORAGE_KEY: string = 'popupLastActiveTab';
export const POPUP_SETTINGS_SCROLL_TARGET_STORAGE_KEY: string = 'popupSettingsScrollTarget';
export const POPUP_SETTINGS_SCROLL_TARGET_BOTTOM: string = 'bottom';
export const GG_DEALS_LOGIN_URL: string = 'https://gg.deals/login/';

// Platform constants
export const PLATFORM_PC = 'pc';
export const PLATFORM_STEAM = 'steam';
export const PLATFORM_XBOX = 'xbox';
export const PLATFORM_PLAYSTATION = 'playstation';
export const PLATFORM_ALL = 'all';
export const PLATFORM_NINTENDO = 'nintendo';
export const PLATFORM_SWITCH = 'switch';

// Theme constants
export const SETTINGS_THEME_DARK = 'dark';
export const SETTINGS_THEME_LIGHT = 'light';
export const SETTINGS_THEME_SYSTEM = 'system';
export const DEFAULT_SETTINGS_THEME = SETTINGS_THEME_DARK;
