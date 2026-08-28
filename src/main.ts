import './styles/style.css'
import { mountExtensionSettings } from './settings/extension-settings';
import { getUiLanguage, t } from './utils/i18n';

console.log('Extension loaded');

document.documentElement.lang = getUiLanguage();
document.title = t('extensionName');

const appearanceSettingsRoot = document.getElementById('appearance-settings-root');

if (appearanceSettingsRoot instanceof HTMLElement) {
	mountExtensionSettings(appearanceSettingsRoot);
}
