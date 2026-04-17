import { useEffect, useState } from 'react';

/** Matches `variables.scss` `$bp-nav` — keep in sync when changing breakpoint. */
const NAV_DRAWER_MEDIA_QUERY = '(max-width: 900px)';

export function useNavDrawerBreakpoint(): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(NAV_DRAWER_MEDIA_QUERY).matches;
    });

    useEffect(() => {
        const mq = window.matchMedia(NAV_DRAWER_MEDIA_QUERY);
        const onChange = (): void => setMatches(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return matches;
}
