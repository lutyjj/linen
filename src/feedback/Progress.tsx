import { type ReactNode, useId, useRef } from "react";

import { classes } from "../foundation/classes";
import { type Live, useFollow } from "./live";

const percent = (value: number) => `${Math.round(value * 100)}%`;

/**
 * Something under way, in place: the phase it is in, in words, and a bar
 * that fills as it goes. Without a value, how far it has come is not known,
 * and a stretch of the bar travels along it while motion is welcome. The
 * phase is said politely as it changes; the bar is a progress bar to
 * assistive technology.
 *
 * A value that changes on its own (`Readable`) is followed without
 * rendering, as a gauge's is.
 */
export function Progress({
    label,
    value,
    format = percent,
    className,
}: {
    /** The phase under way, such as `Uploading`. */
    label: ReactNode;
    /** How far it has come, from 0 to 1. */
    value?: Live<number>;
    /** How far in words, as shown and read out. */
    format?: (value: number) => string;
    className?: string;
}) {
    const name = useId();
    const bar = useRef<HTMLDivElement>(null);
    const words = useRef<HTMLSpanElement>(null);
    const known = value !== undefined;
    useFollow(value ?? 0, (number) => {
        const element = bar.current;
        if (element === null) return;
        // A bar that cannot tell how far says nothing of how far, whatever
        // it said while it could.
        if (!known) {
            element.style.removeProperty("--progress");
            element.removeAttribute("aria-valuenow");
            element.removeAttribute("aria-valuetext");
            return;
        }
        const done = Math.min(1, Math.max(0, number));
        element.style.setProperty("--progress", String(done));
        element.setAttribute("aria-valuenow", String(done));
        element.setAttribute("aria-valuetext", format(done));
        if (words.current !== null) words.current.textContent = format(done);
    });
    return (
        <div className={classes("flex flex-col gap-1 text-sm", className)}>
            <div className="flex items-baseline justify-between gap-4">
                <span id={name} aria-live="polite" className="min-w-0">
                    {label}
                </span>
                {known && (
                    <span
                        ref={words}
                        aria-hidden="true"
                        className="shrink-0 text-xs text-text-secondary tabular-nums"
                    />
                )}
            </div>
            <div
                ref={bar}
                role="progressbar"
                aria-labelledby={name}
                aria-valuemin={known ? 0 : undefined}
                aria-valuemax={known ? 1 : undefined}
                className="relative h-1.5 overflow-hidden rounded-full bg-sunken"
            >
                <span
                    className={classes(
                        "absolute inset-y-0 left-0 rounded-full bg-accent",
                        known
                            ? "progress-known w-full origin-left [scale:var(--progress,0)_1]"
                            : "progress-unknown",
                    )}
                />
            </div>
        </div>
    );
}
