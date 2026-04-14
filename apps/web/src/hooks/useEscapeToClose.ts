import { useEffect } from 'react';

type Options = {
    /** Use capture phase so nested overlays can close before parents (pair with stopPropagation in inner layer). */
    capture?: boolean;
};

/**
 * Calls onClose when Escape is pressed while `enabled` is true.
 */
export function useEscapeToClose(onClose: () => void, enabled: boolean, options?: Options): void {
    const capture = options?.capture ?? false;

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            if (capture) {
                e.stopPropagation();
            }
            onClose();
        };

        document.addEventListener('keydown', onKeyDown, capture);
        return () => document.removeEventListener('keydown', onKeyDown, capture);
    }, [onClose, enabled, capture]);
}
