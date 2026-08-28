import * as Icons from '../icons';

interface BottomPinnedLinkProps {
    url: string;
    label: string;
}

export function BottomPinnedLink({ url, label }: BottomPinnedLinkProps) {
    return (
        <div className="gg-settings-bottom-pinned">
            <a 
                className="gg-settings-bottom-pinned-link" 
                href={url} 
                target="_blank" 
                rel="noreferrer"
            >
                <span className="gg-settings-bottom-pinned-label">{label}</span>
                <Icons.ICON_EXT_ARROW />
            </a>
        </div>
    );
}