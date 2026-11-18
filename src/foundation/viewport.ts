import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";

// The stylesheet's source scan skips this file, whose event names, such as
// "resize", read as classes: it holds no classes.

/**
 * The one breakpoint the interface has, Tailwind's default `md`, which the
 * stylesheet reads from the theme. Tailwind writes it into each query rather
 * than a property a script can read, so it is said here as well, and a test
 * holds it to Tailwind's default theme. Below it the shell is a phone: the
 * rail gives way to the phone's navigation.
 */
const WIDE = "(width >= 48rem)";

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

/**
 * Whether a box scrolls what overflows it, as one that hides it does too:
 * what sticks inside it sticks to it.
 */
export function scrolls(box: Element): boolean {
    return /auto|scroll|hidden/.test(getComputedStyle(box).overflowY);
}

/** The bars that stand now, each with the property that says its height. */
const bars = new Map<HTMLElement, string>();

/** Whether the key last pressed was Tab, which moves the focus in turn. */
let tabbed = false;

function noteKey({ key }: KeyboardEvent) {
    tabbed = key === "Tab";
}

/** Whether a focus target stands inside a box that scrolls in a screen. */
function inBox(target: EventTarget | null): target is Element {
    return (
        target instanceof Element &&
        target.parentElement?.closest("[data-scroll-box]") != null
    );
}

function unpad() {
    document.documentElement.style.removeProperty("scroll-padding-top");
}

/**
 * While the focus is inside a box that scrolls inside a screen
 * (`data-scroll-box`), the room of the bars stuck to the page is the page's
 * scroll padding, so the focus comes to rest clear of them; elsewhere the
 * page has none, so the bars and the popups over them move nothing. Where
 * the Tab key goes, a browser may scroll before it tells of the focus, as
 * Chromium does, so a focus the Tab key brings into a box is brought into
 * view once more with the padding; every other focus stays as it came.
 * LANGUAGE.md says what this leaves short.
 */
function enter({ target }: FocusEvent) {
    const byTab = tabbed;
    tabbed = false;
    if (!inBox(target)) return unpad();
    const root = document.documentElement;
    const entering = root.style.scrollPaddingTop === "";
    let foot = 0;
    for (const bar of bars.keys()) {
        if (!bar.hasAttribute("data-sticky")) continue;
        const top = parseFloat(getComputedStyle(bar).top) || 0;
        foot = Math.max(foot, top + bar.offsetHeight);
    }
    root.style.scrollPaddingTop = `${foot}px`;
    if (entering && byTab) target.scrollIntoView({ block: "nearest" });
}

function leave({ relatedTarget }: FocusEvent) {
    if (!inBox(relatedTarget)) unpad();
}

/**
 * A bar stuck to the top of what scrolls it, as the app's conditions, the
 * top bar and the sections are. On the element it stands in, the custom
 * property `name` follows the bar's height, for the bars stuck beneath it,
 * and stays while another bar of the name stands there, as the next screen's
 * does while this one leaves. While no box that scrolls stands between the
 * bar and the page, the bar also wears `data-sticky`, so what stands below
 * it comes to rest clear of it (linen.css); it looks again as the bar's size
 * changes, not as a box around it changes alone.
 */
export function useStickyBar<Measured extends HTMLElement>(name: string) {
    const measured = useRef<Measured>(null);
    useLayoutEffect(() => {
        const element = measured.current;
        const screen = element?.parentElement;
        if (element == null || screen == null) return;
        if (bars.size === 0) {
            document.addEventListener("keydown", noteKey, true);
            document.addEventListener("focusin", enter);
            document.addEventListener("focusout", leave);
        }
        bars.set(element, name);
        const observer = new ResizeObserver(() => {
            screen.style.setProperty(name, `${element.offsetHeight}px`);
            let box: Element | null = screen;
            while (box && box !== document.body && !scrolls(box)) {
                box = box.parentElement;
            }
            element.toggleAttribute("data-sticky", box === document.body);
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            bars.delete(element);
            element.removeAttribute("data-sticky");
            const other = [...bars].find(
                ([bar, said]) => said === name && bar.parentElement === screen,
            );
            if (other) {
                screen.style.setProperty(name, `${other[0].offsetHeight}px`);
            } else {
                screen.style.removeProperty(name);
            }
            if (bars.size === 0) {
                document.removeEventListener("keydown", noteKey, true);
                document.removeEventListener("focusin", enter);
                document.removeEventListener("focusout", leave);
                unpad();
            }
        };
    }, [name]);
    return measured;
}
