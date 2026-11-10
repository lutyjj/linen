import { useCallback, useSyncExternalStore } from "react";

import { crossFade } from "./motion";

/** What the person asked for, which is not the same as what is on screen. */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = [
    "system",
    "light",
    "dark",
];

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

    /*
     * The preference lives on the root and is kept in storage where the
     * browser allows; a browser that refuses storage keeps it for the page's
     * life.
     */
    function current(): ThemePreference {
        const value = document.documentElement.dataset.theme;
        return value === "light" || value === "dark" ? value : "system";
    }

    function keep(preference: ThemePreference): void {
        try {
            if (preference === "system") localStorage.removeItem(key);
            else localStorage.setItem(key, preference);
        } catch {
            // Kept for this page only.
        }
    }

    function read(): ThemePreference {
        try {
            const value = localStorage.getItem(key);
            return value === "light" || value === "dark" ? value : "system";
        } catch {
            return "system";
        }
    }

    function apply(preference: ThemePreference): void {
        if (preference === "system") {
            delete document.documentElement.dataset.theme;
        } else {
            document.documentElement.dataset.theme = preference;
        }
        keep(preference);
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

    apply(read());

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
