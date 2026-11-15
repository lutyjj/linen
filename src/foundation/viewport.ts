import { useCallback, useRef, useState, useSyncExternalStore } from "react";

/**
 * The one breakpoint the interface has, matching Tailwind's `md`. Below it
 * the shell is a phone: the rail gives way to the phone's navigation, tables
 * read as cards, and the keyboard shortcuts stand down.
 */
const WIDE = "(min-width: 768px)";

function subscribe(listener: () => void): () => void {
    const media = window.matchMedia(WIDE);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
}

/** True below `md`, where layouts that assume a desk must not be used. */
export function useNarrow(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => !window.matchMedia(WIDE).matches,
    );
}

/**
 * How wide an element is, for a layout the viewport cannot answer for: a
 * table shares out the width of its own box, which the rail beside it and the
 * card around it have already spent some of. Undefined until it is measured.
 *
 * A callback ref rather than a `RefObject`, because the element being measured
 * is sometimes replaced by the very decision the measurement makes: a table
 * too narrow for its columns unmounts and comes back as a list of cards, and
 * an observer attached once would go on reporting the width of an element that
 * is no longer on the page.
 */
export function useWidth(): [
    (element: HTMLElement | null) => void,
    number | undefined,
] {
    const [width, setWidth] = useState<number>();
    const watching = useRef<ResizeObserver>(null);
    const measure = useCallback((element: HTMLElement | null) => {
        watching.current?.disconnect();
        if (element === null) return;
        watching.current = new ResizeObserver(([entry]) => {
            if (entry !== undefined) setWidth(entry.contentRect.width);
        });
        watching.current.observe(element);
    }, []);
    return [measure, width];
}
