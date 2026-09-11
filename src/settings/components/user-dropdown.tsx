import { useState, useRef, useEffect } from 'preact/hooks';
import type { AuthenticatedGGUserSettingsData } from '../helpers';
import * as Icons from '../icons';
import { t } from '../../utils/i18n';

interface UserDropdownProps {
    userSettings: AuthenticatedGGUserSettingsData;
    fetchSettings: () => Promise<void>;
    signOut: () => void;
}

export function UserDropdown({ userSettings, fetchSettings, signOut }: UserDropdownProps) {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={dropdownRef}
            className={`gg-user-dropdown ${isUserDropdownOpen ? 'open' : ''}`}
        >
            <div
                className="gg-user-dropdown-trigger"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
                <div className="gg-user-avatar">
                    {userSettings.avatar ? (
                        <img
                            className="gg-user-avatar-image"
                            src={userSettings.avatar}
                            alt={t('userAvatarAlt', userSettings.username || t('user'))}
                        />
                    ) : (
                        <Icons.ICON_LOGIN_AVATAR />
                    )}
                </div>
                <Icons.ICON_DROPDOWN_ARROW />
            </div>

            <div className="gg-user-dropdown-list">
                <div
                    className="gg-user-dropdown-option"
                    onClick={() => {
                        void fetchSettings()
                            .catch((error) => {
                                console.warn('[gg.deals-extension] Failed to fetch GG user settings:', error);
                            })
                            .finally(() => {
                                setIsUserDropdownOpen(false);
                            });
                    }}
                >
                    <Icons.ICON_USER_SYNC />
                    <span className="gg-user-dropdown-item-label">
                        {t('getSettingsFromGgDeals')}
                    </span>
                </div>
                <div
                    className="gg-user-dropdown-option"
                    onClick={() => {
                        signOut();
                        setIsUserDropdownOpen(false);
                    }}
                >
                    <Icons.ICON_USER_LOGOUT />
                    <span className="gg-user-dropdown-item-label">
                        {t('signOut')}
                    </span>
                </div>
            </div>
        </div>
    );
}
