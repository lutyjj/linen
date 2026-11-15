import { afterEach, expect, it, vi } from "vitest";

import { crossFade } from "./crossFade";

/** Fades the page has started, each finished when the test says. */
const finish: (() => void)[] = [];

afterEach(() => {
    finish.length = 0;
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document, "startViewTransition");
});

function stubViewTransitions() {
    Object.defineProperty(document, "startViewTransition", {
        configurable: true,
        value: (update: () => void) => {
            update();
            const finished = new Promise<void>((resolve) =>
                finish.push(resolve),
            );
            return { finished };
        },
    });
}

const fading = () => document.documentElement.classList.contains("cross-fade");

it("keeps the fade's springs through a change made while one runs", async () => {
    stubViewTransitions();
    const changes: string[] = [];
    crossFade(() => changes.push("dark"));
    crossFade(() => changes.push("light"));
    expect(changes).toEqual(["dark", "light"]);

    finish[0]?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(fading()).toBe(true);

    finish[1]?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(fading()).toBe(false);
});
