import type { ComponentChildren } from 'preact';
import * as Icons from '../icons';
import { useEffect, useState } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { t } from '../../utils/i18n';

interface InfoBoxProps {
    type?: 'warning' | 'info' | 'success' | 'error';
    heading: string;
    linkUrl?: string;
    linkLabel?: string;
    onSignInClick?: () => void;
    dismissStorageKey?: string;
    nonDismissible?: boolean;
    onDismiss?: () => void | Promise<void>;
    children: ComponentChildren;
}

export function InfoBox({
    type = 'warning',
    heading,
    linkUrl,
    linkLabel,
    onSignInClick,
    dismissStorageKey = 'infoBoxDismissed',
    nonDismissible = false,
    onDismiss,
    children
}: InfoBoxProps) {

    const key = dismissStorageKey;
    const externallyManagedDismissal = typeof onDismiss === 'function';
    const [isDismissed, setIsDismissed] = useState<boolean | null>(nonDismissible ? false : null);

    async function handleCloseClick() {
        if (nonDismissible) {
            return;
        }

        setIsDismissed(true);

        if (onDismiss) {
            try {
                await onDismiss();
            } catch (error) {
                setIsDismissed(false);
                console.warn('[gg.deals-extension] Failed to dismiss info box:', error);
            }
            return;
        }

        void browser.storage.session.set({ [key]: true }).catch((error: unknown) => {
            console.warn('[gg.deals-extension] Failed to save dismissed info box state:', error);
        });
    }

    useEffect(() => {
        if (nonDismissible) {
            setIsDismissed(false);
            return;
        }
        if (externallyManagedDismissal) {
            setIsDismissed(false);
            return;
        }

        let isCancelled = false;

        setIsDismissed(null);

        browser.storage.session.get(key)
            .then((result) => {
                if (!isCancelled) {
                    setIsDismissed(result[key] === true);
                }
            })
            .catch((error: unknown) => {
                console.warn('[gg.deals-extension] Failed to read dismissed info box state:', error);

                if (!isCancelled) {
                    setIsDismissed(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [nonDismissible, externallyManagedDismissal, key]);

    if (isDismissed !== false) {
        return null;
    }

    const shouldTriggerSignInFetch = typeof linkUrl === 'string' && /\/login\//.test(linkUrl);

    return (
        <div className={`gg-info-box gg-info-box-${type}`}>
            {!nonDismissible && (
                <span class="gg-info-box-close" title={t('close')} onClick={handleCloseClick}>
                    <Icons.ICON_X />
                </span>
            )}

            <div className="gg-info-box-heading">{heading}</div>
            <div className="gg-info-box-content">
                {children}

                {linkUrl && (
                    <a
                        href={linkUrl}
                        target={shouldTriggerSignInFetch ? undefined : '_blank'}
                        rel={shouldTriggerSignInFetch ? undefined : 'noreferrer'}
                        className="gg-info-box-content-link"
                        onClick={(event) => {
                            if (!shouldTriggerSignInFetch) {
                                return;
                            }

                            event.preventDefault();
                            onSignInClick?.();
                        }}
                    >
                        {linkLabel && <span className="gg-info-box-content-link-label">{linkLabel}</span>}
                        {linkLabel && <Icons.ICON_EXT_ARROW />}
                    </a>
                )}
            </div>
        </div>
    );
}
