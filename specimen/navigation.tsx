import type { MouseEvent } from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import type { Blocker, LinkProps, Navigation } from "../src";

/**
 * How the specimen moves between its pages: the browser's history, and a
 * move held while unsaved work asks first. It is the adapter an app without
 * a router writes. The browser's own back and forward are not held.
 */
const listeners = new Set<() => void>();

/** Whether a move to a path is held, while a guard is on the page. */
let holds: ((next: string) => boolean) | undefined;
/** The move held until the person answers. */
let held: { href: string; replace: boolean } | undefined;

function notify(): void {
    for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    window.addEventListener("popstate", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("popstate", listener);
    };
}

/** Moves to `href` within the page, as a followed link would. */
export function navigate(href: string, { replace = false } = {}): void {
    if (holds?.(new URL(href, window.location.href).pathname)) {
        held = { href, replace };
        notify();
    } else {
        move(href, replace);
    }
}

function move(href: string, replace: boolean): void {
    held = undefined;
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
    notify();
}

/** A press the browser should keep: another tab, a download, a modifier. */
function belongsToBrowser(event: MouseEvent<HTMLAnchorElement>): boolean {
    return (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        (event.currentTarget.target !== "" &&
            event.currentTarget.target !== "_self")
    );
}

function Link({ href, onClick, ...props }: LinkProps) {
    return (
        <a
            {...props}
            href={href}
            onClick={(event) => {
                onClick?.(event);
                if (belongsToBrowser(event)) return;
                event.preventDefault();
                navigate(href);
            }}
        />
    );
}

function usePathname(): string {
    return useSyncExternalStore(subscribe, () => window.location.pathname);
}

function useBlocker(when: (next: string) => boolean): Blocker {
    const latest = useRef(when);
    useEffect(() => {
        latest.current = when;
    });
    useEffect(() => {
        holds = (next) => latest.current(next);
        return () => {
            holds = undefined;
        };
    }, []);
    const blocked = useSyncExternalStore(subscribe, () => held !== undefined);
    return {
        blocked,
        proceed: () => {
            if (held) move(held.href, held.replace);
        },
        reset: () => {
            held = undefined;
            notify();
        },
    };
}

export const historyNavigation: Navigation = { Link, usePathname, useBlocker };
