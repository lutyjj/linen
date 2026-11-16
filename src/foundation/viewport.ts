import { useCallback, useRef, useState, useSyncExternalStore } from "react";

// The stylesheet's source scan and the generated class groups skip this file,
// whose event names, such as "resize", read as classes: it holds no classes.

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

/**
 * Holds an element to the part of the window a person can see: the visual
 * viewport, which an on-screen keyboard shortens while the layout viewport
 * stays as it was. The element reads its top and height as `--visible-top`
 * and `--visible-height`, written as the visual viewport moves, without a
 * render, and once it shortens, the field being typed in is scrolled back
 * into view within it. While the page is zoomed, or where there is no visual
 * viewport, it keeps its own fallbacks.
 */
export function useVisibleViewport(): (element: HTMLElement | null) => void {
    const stop = useRef<() => void>(null);
    return useCallback((element: HTMLElement | null) => {
        stop.current?.();
        stop.current = null;
        const visible = window.visualViewport;
        if (element === null || !visible) return;
        const follow = () => {
            if (visible.scale !== 1) {
                element.style.removeProperty("--visible-top");
                element.style.removeProperty("--visible-height");
                return;
            }
            element.style.setProperty(
                "--visible-top",
                `${visible.offsetTop}px`,
            );
            element.style.setProperty(
                "--visible-height",
                `${visible.height}px`,
            );
        };
        // A keyboard opens over the field that took the focus. A pinch, or a
        // view that grows, leaves the focus where the person put it.
        let last = visible.height;
        const resize = () => {
            follow();
            const shorter = visible.height < last;
            last = visible.height;
            if (!shorter || visible.scale !== 1) return;
            const focused = document.activeElement;
            if (focused instanceof HTMLElement && element.contains(focused)) {
                focused.scrollIntoView({ block: "nearest" });
            }
        };
        follow();
        visible.addEventListener("resize", resize);
        visible.addEventListener("scroll", follow);
        stop.current = () => {
            visible.removeEventListener("resize", resize);
            visible.removeEventListener("scroll", follow);
        };
    }, []);
}
