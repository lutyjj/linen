import { flushSync } from "react-dom";

import { STILL } from "./tokens";

/**
 * Make a change the whole page wears, such as its theme or its language, as
 * one cross-fade rather than one frame. The change is applied at once and
 * the fade follows it. This is the platform's View Transitions API: the
 * whole page is one snapshot, and motion.css fades it over `enter`.
 */
export function crossFade(change: () => void): void {
    if (
        typeof document.startViewTransition !== "function" ||
        window.matchMedia(STILL).matches
    ) {
        change();
        return;
    }
    const root = document.documentElement;
    root.classList.add("cross-fade");
    const fade = document.startViewTransition(() => flushSync(change));
    latestFade = fade;
    // A change made mid-fade skips this one; the newer fade keeps the class.
    void fade.finished.finally(() => {
        if (latestFade === fade) root.classList.remove("cross-fade");
    });
}

let latestFade: ViewTransition | undefined;
