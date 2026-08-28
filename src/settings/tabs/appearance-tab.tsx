import type { ComponentType } from 'preact';
import { BOTTOM_EDGE, DARK, EDGE_TO_EDGE, FIT_CONTENT, FIXED, LIGHT, ROUNDED, ROUNDED_CORNERS, ROUNDED_TOP, SYSTEM, type AppearanceTabProps, type SettingsLayout, type SettingsTheme } from '../helpers';
import { hasGGUserSettingsData, loadGGUserSettings } from '../helpers';
import { InfoBox } from '../components/info-box';
import { BottomPinnedLink } from '../components/bottom-pinned-link';
import * as Icons from '../icons';
import { t } from '../../utils/i18n';

const THEME_OPTIONS: Array<{ value: SettingsTheme; messageName: string; icon: ComponentType }> = [
    { value: DARK, messageName: 'themeDark', icon: Icons.ICON_THEME_DARK },
    { value: LIGHT, messageName: 'themeLight', icon: Icons.ICON_THEME_LIGHT },
    { value: SYSTEM, messageName: 'themeSystem', icon: Icons.ICON_THEME_SYSTEM }
];

const ROUNDING_OPTIONS: Array<{ value: Exclude<SettingsLayout, typeof BOTTOM_EDGE>; messageName: string; icon: ComponentType }> = [
    { value: ROUNDED, messageName: 'roundingRounded', icon: Icons.ICON_ROUNDING_ROUNDED },
    { value: ROUNDED_CORNERS, messageName: 'roundingRoundedCorners', icon: Icons.ICON_ROUNDING_CORNERS },
    { value: ROUNDED_TOP, messageName: 'roundingRoundedTop', icon: Icons.ICON_ROUNDING_TOP }
];

export function AppearanceTab(props: AppearanceTabProps) {
    const isLoggedIn = hasGGUserSettingsData(loadGGUserSettings());

    return (
        <section className="gg-settings-pill-container with-pinned-link" aria-label={t('appearanceTabAria')}>
            {!isLoggedIn && <InfoBox
                type="warning"
                heading={t('signInBetterHeading')}
                linkUrl="https://gg.deals/login"
                linkLabel={t('signIn')}
                onSignInClick={props.onSignInClick}
            >
                {t('signInBetterDescription')}
            </InfoBox>}

            <BottomPinnedLink
                url="https://gg.deals/settings"
                label={t('ggDealsUserSettings')}
            />

            <section className="gg-settings-pill active">
                <div className="gg-settings-pill-icon">
                    <Icons.ICON_THEME_DM />
                    <Icons.ICON_THEME_LM />
                </div>

                <div className="gg-settings-pill-content">
                    <div className="gg-settings-pill-title">{t('appearanceThemeTitle')}</div>
                    <div className="gg-settings-pill-desc">{t('appearanceThemeDescription')}</div>
                </div>

                <div className="gg-settings-pill-radio-buttons" role="group" aria-label={t('appearanceThemeOptionsAria')}>
                    {THEME_OPTIONS.map((option) => {
                        const Icon = option.icon; 

                        return (<label className="gg-settings-pill-radio-button" key={option.value}>
                            <input
                                type="radio"
                                name="appearance-theme"
                                checked={props.theme === option.value}
                                onChange={() => props.onThemeChange(option.value)}
                            />
                            <div className="gg-settings-pill-radio-label">
                                <Icon />
                                <span className="gg-settings-pill-radio-label-text">
                                    {t(option.messageName)}
                                </span>
                            </div>
                        </label>);
                    })}
                </div>
            </section>

            <section className="gg-settings-pill active">
                <div className="gg-settings-pill-icon">
                    <Icons.ICON_BAR_WIDTH />
                </div>

                <div className="gg-settings-pill-content">
                    <div className="gg-settings-pill-title">{t('appearanceBarWidthTitle')}</div>
                    <div className="gg-settings-pill-desc">{t('appearanceBarWidthDescription')}</div>

                    <div className="gg-settings-radio-wrapper" role="group" aria-label={t('appearanceBarWidthOptionsAria')}>
                        <label className="gg-settings-radio-single">
                            <input
                                type="radio"
                                name="bar-width"
                                checked={props.barWidth === FIXED}
                                onChange={() => props.onBarWidthChange(FIXED)}
                            />
                            <span className="gg-radio-circle"></span>
                            <span className="gg-radio-icon">
                                <Icons.ICON_BAR_FIXED />
                            </span>
                            <span className="gg-radio-label">{t('barWidthFixed')}</span>
                        </label>
                        <label className="gg-settings-radio-single">
                            <input
                                type="radio"
                                name="bar-width"
                                checked={props.barWidth === FIT_CONTENT}
                                onChange={() => props.onBarWidthChange(FIT_CONTENT)}
                            />
                            <span className="gg-radio-circle"></span>
                            <span className="gg-radio-icon">
                                <Icons.ICON_BAR_FIT_CONTENT />
                            </span>
                            <span className="gg-radio-label">{t('barWidthFitContent')}</span>
                        </label>
                        <label className="gg-settings-radio-single">
                            <input
                                type="radio"
                                name="bar-width"
                                checked={props.barWidth === EDGE_TO_EDGE}
                                onChange={() => props.onBarWidthChange(EDGE_TO_EDGE)}
                            />
                            <span className="gg-radio-circle"></span>
                            <span className="gg-radio-icon">
                                <Icons.ICON_BAR_EDGE />
                            </span>
                            <span className="gg-radio-label">{t('barWidthEdgeToEdge')}</span>
                        </label>
                    </div>
                </div>
            </section>

            <section className="gg-settings-pill active">
                <div className="gg-settings-pill-icon">
                    <Icons.ICON_BAR_ROUNDING />
                </div>

                <div className="gg-settings-pill-content">
                    <div className="gg-settings-pill-title">{t('appearanceBarRoundingTitle')}</div>
                    <div className="gg-settings-pill-desc">{t('appearanceBarRoundingDescription')}</div>
       
                    <fieldset className="gg-settings-radio-wrapper" aria-label={t('appearanceRoundingOptionsAria')} disabled={props.barWidth === EDGE_TO_EDGE}>
                        {ROUNDING_OPTIONS.map((option) => {
                            const Icon = option.icon; 

                            return (
                                <label className="gg-settings-radio-single" key={option.value}>
                                    <input
                                        type="radio"
                                        name="bar-rounding"
                                        checked={props.rounding === option.value}
                                        onChange={() => props.onRoundingChange(option.value)}
                                    />
                                    <span className="gg-radio-circle"></span>
                                    <span className="gg-radio-icon">
                                        <Icon /> 
                                    </span>
                                    <span className="gg-radio-label">{t(option.messageName)}</span>
                                </label>
                            );
                        })}
                    </fieldset>
                </div>
            </section>
        </section>
    );
}
