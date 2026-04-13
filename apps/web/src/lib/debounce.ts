export function debounce<T>(fn: (payload: T) => void, ms: number) {
    let t: ReturnType<typeof setTimeout> | null = null;
    let lastArg: T | undefined;

    const wrapped = (payload: T) => {
        lastArg = payload;
        if (t) clearTimeout(t);
        t = setTimeout(() => {
            t = null;
            if (lastArg !== undefined) fn(lastArg);
        }, ms);
    };

    wrapped.flush = () => {
        if (t) {
            clearTimeout(t);
            t = null;
        }
        if (lastArg !== undefined) fn(lastArg);
    };

    wrapped.cancel = () => {
        if (t) clearTimeout(t);
        t = null;
    };

    return wrapped as typeof wrapped & { flush: () => void; cancel: () => void };
}
