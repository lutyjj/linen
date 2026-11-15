import type { Readable } from "../src";

/**
 * Two levels that wander on their own twenty times a second while anything
 * watches them, each with the highest it reached in the last two seconds:
 * what a live gauge follows.
 */
export function wandering(starts: readonly number[], min: number, max: number) {
    const levels = [...starts];
    const highs = [...starts];
    const heldUntil = starts.map(() => 0);
    const listeners = new Set<() => void>();
    let timer: ReturnType<typeof setInterval> | undefined;

    function step() {
        const now = Date.now();
        levels.forEach((level, index) => {
            const next = Math.min(
                max,
                Math.max(
                    min,
                    level + (Math.random() - 0.5) * (max - min) * 0.12,
                ),
            );
            levels[index] = next;
            if (
                next >= (highs[index] ?? min) ||
                now > (heldUntil[index] ?? 0)
            ) {
                highs[index] = next;
                heldUntil[index] = now + 2000;
            }
        });
        for (const listener of listeners) listener();
    }

    function readable(read: () => number): Readable<number> {
        return {
            subscribe: (listener) => {
                const tell = () => listener(read());
                listeners.add(tell);
                tell();
                timer ??= setInterval(step, 50);
                return () => {
                    listeners.delete(tell);
                    if (listeners.size === 0) {
                        clearInterval(timer);
                        timer = undefined;
                    }
                };
            },
        };
    }

    return starts.map((_, index) => ({
        level: readable(() => levels[index] ?? min),
        high: readable(() => highs[index] ?? min),
    }));
}
