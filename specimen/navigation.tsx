import type { MouseEvent } from "react";
import { useSyncExternalStore } from "react";

import type { LinkProps, Navigation } from "../src";

/**
 * How the specimen moves between its pages: the browser's history and
 * nothing else, which is all a `Navigation` needs. It is the adapter an app
 * without a router writes.
 */
const listeners = new Set<() => void>();

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
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
    for (const listener of listeners) listener();
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

export const historyNavigation: Navigation = { Link, usePathname };
