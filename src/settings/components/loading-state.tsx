import * as Icons from '../icons';

interface LoadingStateProps {
    hidden?: boolean;
}

export function LoadingState({ hidden = false }: LoadingStateProps) {
    return (
        <div className={`loading-state${hidden ? ' hidden' : ''}`}>
            <Icons.ICON_LOADING />
        </div>
    );
}
