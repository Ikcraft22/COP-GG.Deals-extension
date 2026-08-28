import { useState, useRef, useEffect } from "preact/hooks";
import * as Icons from '../icons';

interface DropdownOption {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    id: string;
    name: string;
    currentValue: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
}

export function CustomDropdown({ id, name, currentValue, options, onChange }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [scrollMetrics, setScrollMetrics] = useState({
        visible: false,
        thumbHeight: 0,
        thumbTop: 0
    });

    const currentLabel = options.find(opt => opt.value === currentValue)?.label || currentValue;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll tracking attached to inner scroll box, mapping locations to the parent container bounds
    useEffect(() => {
        const listEl = listRef.current;
        if (!isOpen || !listEl) {
            setScrollMetrics(prev => ({ ...prev, visible: false }));
            return;
        }

        const calculateLocalScrollbar = () => {
            const scrollTop = listEl.scrollTop;
            const clientHeight = listEl.clientHeight; 
            const scrollHeight = listEl.scrollHeight; 

            if (scrollHeight <= clientHeight) {
                setScrollMetrics({ visible: false, thumbHeight: 0, thumbTop: 0 });
                return;
            }

            const trackPadding = 4;
            const usableTrackHeight = clientHeight - (trackPadding * 2);

            const visibilityRatio = clientHeight / scrollHeight;
            const calculatedThumbHeight = Math.max(24, usableTrackHeight * visibilityRatio);

            const maxScrollableDistance = scrollHeight - clientHeight;
            const currentScrollPercent = maxScrollableDistance > 0 ? scrollTop / maxScrollableDistance : 0;

            const maxThumbTravelDistance = usableTrackHeight - calculatedThumbHeight;
            const calculatedThumbTop = trackPadding + (maxThumbTravelDistance * currentScrollPercent);

            setScrollMetrics({
                visible: true,
                thumbHeight: calculatedThumbHeight,
                thumbTop: calculatedThumbTop
            });
        };

        listEl.addEventListener('scroll', calculateLocalScrollbar, { passive: true });
        
        const localResizeObserver = new ResizeObserver(() => calculateLocalScrollbar());
        localResizeObserver.observe(listEl);

        calculateLocalScrollbar();

        return () => {
            listEl.removeEventListener('scroll', calculateLocalScrollbar);
            localResizeObserver.disconnect();
        };
    }, [isOpen, options]);

    return (
        <div 
            ref={dropdownRef} 
            className={`gg-settings-pill-select-box ${isOpen ? 'open' : ''}`}
        >
            <input 
                type="hidden" 
                name={name} 
                id={id} 
                value={currentValue}
            />
            
            <div className="gg-settings-select-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span className="gg-settings-select-label">{currentLabel}</span>
                <Icons.ICON_DROPDOWN_ARROW />
            </div>
            
            <div className="gg-settings-select-list-container">
                <div ref={listRef} className="gg-settings-select-list">
                    {options.map((option) => (
                        <div 
                            key={option.value}
                            className={`gg-settings-select-option ${currentValue === option.value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>

                {scrollMetrics.visible && (
                    <div 
                        className="gg-dropdown-scroll-indicator"
                        style={{
                            height: `${scrollMetrics.thumbHeight}px`,
                            top: `${scrollMetrics.thumbTop}px`
                        }}
                    />
                )}
            </div>
        </div>
    );
}