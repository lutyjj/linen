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

// Nor does jsdom scroll: bringing an element into view does nothing.
if (!("scrollIntoView" in Element.prototype)) {
    Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        value: () => undefined,
    });
}

// Nor does jsdom know an animation's events, which name the animation.
if (!("AnimationEvent" in window)) {
    class AnimationEventStub extends Event {
        readonly animationName: string;
        readonly elapsedTime: number;
        readonly pseudoElement: string;
        constructor(type: string, init: AnimationEventInit = {}) {
            super(type, init);
            this.animationName = init.animationName ?? "";
            this.elapsedTime = init.elapsedTime ?? 0;
            this.pseudoElement = init.pseudoElement ?? "";
        }
    }
    Object.defineProperty(window, "AnimationEvent", {
        configurable: true,
        value: AnimationEventStub,
    });
}
