import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { WebsiteItem } from '../excluded-websites';
import * as Icons from '../icons';
import { t } from '../../utils/i18n';

interface ExcludedWebsitesManagerProps {
    initialItems: WebsiteItem[];
    onItemsChange?: (items: WebsiteItem[]) => void;
}

interface ConfirmState {
    isOpen: boolean;
    type: 'single' | 'batch';
    targetValue?: string; // Used for identifying a single site deletion
    message: ComponentChildren;
}

export function ExcludedWebsitesManager({ initialItems, onItemsChange }: ExcludedWebsitesManagerProps) {
    const [items, setItems] = useState<WebsiteItem[]>(initialItems ?? []);
    const [filterQuery, setFilterQuery] = useState('');
    const [confirm, setConfirm] = useState<ConfirmState>({
        isOpen: false,
        type: 'batch',
        message: ''
    });

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Process filter query: Active only when length is greater than or equal to n characters
    const isFilterActive = filterQuery.trim().length >= 1;
    const filteredItems = isFilterActive
        ? items.filter(item => item.label.toLowerCase().includes(filterQuery.toLowerCase()))
        : items;

    // --- Action Handlers ---
    
    const triggerRemoveSingle = (value: string, label: string) => {
        setConfirm({
            isOpen: true,
            type: 'single',
            targetValue: value,
            message: t('excludedRemoveSingleConfirm', label)
        });
    };

    const triggerRemoveBatch = () => {
        const targetCount = filteredItems.length;
        const msg = isFilterActive
            ? t('excludedRemoveFilteredConfirm', String(targetCount))
            : t('excludedRemoveAllConfirm', String(targetCount));

        setConfirm({
            isOpen: true,
            type: 'batch',
            message: msg
        });
    };

    const handleConfirmAction = () => {
        let nextItems: WebsiteItem[] = items;

        if (confirm.type === 'single' && confirm.targetValue) {
            nextItems = items.filter(item => item.value !== confirm.targetValue);
        } else if (confirm.type === 'batch') {
            // Remove only the items currently visible in the active filtered view
            const filteredValues = new Set(filteredItems.map(item => item.value));
            nextItems = items.filter(item => !filteredValues.has(item.value));
        }

        setItems(nextItems);
        onItemsChange?.(nextItems);
        closeModal();
    };

    const closeModal = () => {
        setConfirm(prev => ({ ...prev, isOpen: false }));
    };

    // If all items are deleted dynamically via the UI, fade the component away clean
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="gg-websites-manager">
            {/* Top Controls Row */}
            <div className="gg-websites-controls-row">
                <div className="gg-websites-search-input-wrapper">
                    <input
                        type="text"
                        className="gg-websites-search-input"
                        placeholder=""
                        value={filterQuery}
                        onInput={(e) => setFilterQuery((e.target as HTMLInputElement).value)}
                    />
                    <span className="gg-ext-settings-search-label">{t('excludedSearchWebsites')}</span>
                    <Icons.ICON_SEARCH />
                </div>
                <button 
                    type="button" 
                    className="gg-websites-btn-remove-all"
                    disabled={filteredItems.length === 0}
                    onClick={triggerRemoveBatch}
                >
                    {t('excludedRemoveAll')}
                </button>
            </div>

            {/* Websites Rows List */}
            <ul className="gg-websites-list">
                {filteredItems.map((item) => (
                    <li key={item.value} className="gg-websites-item-row">
                        <span className="gg-websites-item-label">{item.label}</span>
                        <button
                            type="button"
                            className="gg-websites-btn-remove"
                            onClick={() => triggerRemoveSingle(item.value, item.label)}
                        >
                            <span className="gg-websites-btn-remove-label">{t('excludedRemoveLowercase')}</span>
                            <Icons.ICON_X_ITEM />
                        </button>
                    </li>
                ))}
                {filteredItems.length === 0 && (
                    <li className="gg-websites-empty-state">{t('excludedNoMatches')}</li>
                )}
            </ul>

            {/* Custom Fixed HTML Confirm Dialog */}
            {confirm.isOpen && (
                <div className="gg-custom-modal-overlay">
                    <div className="gg-custom-modal-box">
                        <div className="gg-custom-modal-description">
                            {confirm.message}
                        </div>
                        <div className="gg-custom-modal-actions-row">
                            <button 
                                type="button" 
                                className="gg-custom-modal-btn gg-custom-modal-btn-cancel"
                                onClick={closeModal}
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="button" 
                                className="gg-custom-modal-btn gg-custom-modal-btn-remove"
                                onClick={handleConfirmAction}
                            >
                                {t('excludedRemove')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
