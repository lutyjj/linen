import "@testing-library/jest-dom/vitest";

import { MotionGlobalConfig } from "motion/react";

/**
 * jsdom draws no frames, so an animation would never finish and an exit
 * would hold its element forever. Every Motion animation lands at once.
 */
MotionGlobalConfig.skipAnimations = true;

// Nor does jsdom answer media queries: nothing matches.
Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) =>
        ({
            matches: false,
            media: query,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
});

// Nor does jsdom lay anything out: what observes its own size hears once.
class ResizeObserverStub {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element) {
        this.callback(
            [
                { target, contentRect: target.getBoundingClientRect() },
            ] as unknown as ResizeObserverEntry[],
            this,
        );
    }
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver ??=
    ResizeObserverStub as unknown as typeof ResizeObserver;
