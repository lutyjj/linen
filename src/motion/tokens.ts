import type { Transition } from "motion/react";
import { useSyncExternalStore } from "react";

/** Shared timing and accessibility policy for interaction animations. */
const DURATION = {
    leave: 0.12,
    state: 0.18,
    enter: 0.28,
    mark: 1.2,
    stagger: 0.08,
    thinking: 1.5,
    land: 1,
} as const;
export type MotionToken = keyof typeof DURATION;

/**
 * The curves of motions that are not the spring. A fall is let go and
 * decelerates into its place from its first frame; a breath has no arrival
 * to settle into, so it crosses evenly; a fade leaves quickly and trails off.
 */
export const EASE = {
    fall: [0.2, 0, 0, 1],
    breath: [0.42, 0, 0.58, 1],
    fade: "easeOut",
} as const;

export const STILL = "(prefers-reduced-motion: reduce)";

/** A token's length in seconds, the unit Motion reads. */
export function seconds(token: MotionToken): number {
    if (window.matchMedia(STILL).matches) return 0;
    return DURATION[token];
}

/**
 * A spring released from rest, settling without overshoot.
 */
export function spring(token: MotionToken): Transition {
    const duration = seconds(token);
    return duration === 0
        ? { duration: 0 }
        : { type: "spring", visualDuration: duration, bounce: 0 };
}

function subscribe(listener: () => void): () => void {
    const media = window.matchMedia(STILL);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
}

/** Live preference, including changes while the page is open. */
export function useStill(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(STILL).matches,
    );
}

function subscribeVisibility(listener: () => void): () => void {
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
}

/** Nonessential loops rest in hidden tabs and for readers asking for stillness. */
export function useLoop(): boolean {
    const still = useStill();
    const visible = useSyncExternalStore(
        subscribeVisibility,
        () => document.visibilityState !== "hidden",
    );
    return !still && visible;
}
