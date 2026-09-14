import * as Icons from '../icons';

interface LoadingStateProps {
    hidden?: boolean;
}

export function LoadingState({ hidden = false }: LoadingStateProps) {
    if (hidden) {
        return null;
    }

    return (
        <div className="loading-state">
            <Icons.ICON_LOADING />
        </div>
    );
}
