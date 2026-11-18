import { useCallback, useSyncExternalStore } from "react";

import { keep, readKept } from "./foundation/kept";
import { crossFade } from "./motion/crossFade";

/** What the person asked for, which is not the same as what is on screen. */
export type ThemePreference = "system" | "light" | "dark";

/** Every preference, in the order a choice of them offers them. */
export const THEME_PREFERENCES: readonly ThemePreference[] = [
    "system",
    "light",
    "dark",
];

/** A pinned preference, or the system's where none is. */
function pinned(value: string | null | undefined): ThemePreference {
    return value === "light" || value === "dark" ? value : "system";
}

export interface ThemeStore {
    /** The preference in force on this page. */
    current: () => ThemePreference;
    useTheme: () => {
        preference: ThemePreference;
        setPreference: (preference: ThemePreference) => void;
    };
}

/**
 * The theme preference of one app in this browser.
 *
 * Dark follows prefers-color-scheme until the person says otherwise, and
 * `data-theme` on the root then overrides it in both directions; the
 * stylesheet's `light-dark()` pairs do the rest. The preference is applied as
 * the store is made, so a reload keeps it before the first control mounts;
 * the app's `index.html` sets the same attribute from the same key before
 * the stylesheet paints.
 *
 * `bar` is the page's background in each scheme, for the browser's own
 * chrome: once a preference is pinned, the `theme-color` metas carry it
 * rather than the system's.
 */
export function createThemeStore({
    key,
    bar,
}: {
    key: string;
    bar?: { light: string; dark: string };
}): ThemeStore {
    const listeners = new Set<() => void>();

    /* The preference in force is the root's `data-theme`; `keep` stores it
     * in this browser. */
    function current(): ThemePreference {
        return pinned(document.documentElement.dataset.theme);
    }

    function apply(preference: ThemePreference): void {
        if (preference === "system") {
            delete document.documentElement.dataset.theme;
        } else {
            document.documentElement.dataset.theme = preference;
        }
        keep(key, preference === "system" ? null : preference);
        if (bar === undefined) return;
        for (const meta of document.querySelectorAll<HTMLMetaElement>(
            'meta[name="theme-color"]',
        )) {
            const scheme =
                preference === "system"
                    ? (meta.getAttribute("media") ?? "").includes("dark")
                        ? "dark"
                        : "light"
                    : preference;
            meta.content = bar[scheme];
        }
    }

    apply(pinned(readKept(key)));

    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    /*
     * One store behind every control, because two can be mounted at once (a
     * menu and a settings page) and a control that misses the other's change
     * reads as stuck.
     */
    function useTheme() {
        const preference = useSyncExternalStore(subscribe, current);
        return {
            preference,
            setPreference: useCallback((next: ThemePreference) => {
                crossFade(() => {
                    apply(next);
                    for (const listener of listeners) listener();
                });
            }, []),
        };
    }

    return { current, useTheme };
}
