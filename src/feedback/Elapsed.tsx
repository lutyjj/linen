import { useEffect, useState } from "react";

import { classes } from "../foundation/classes";

/** A span of time as a clock reads it: `0:42`, `12:05`, `1:02:09`. */
export function elapsedText(milliseconds: number): string {
    const total = Math.max(0, Math.floor(milliseconds / 1000));
    const seconds = total % 60;
    const minutes = Math.floor(total / 60) % 60;
    const hours = Math.floor(total / 3600);
    const two = (part: number) => String(part).padStart(2, "0");
    return hours > 0
        ? `${hours}:${two(minutes)}:${two(seconds)}`
        : `${minutes}:${two(seconds)}`;
}

/**
 * How long something has been going, counted up once a second. It renders
 * itself alone as it counts, and as a timer it is not read out on each
 * tick.
 */
export function Elapsed({
    since,
    className,
}: {
    /** When it began, in milliseconds since the epoch, as `Date.now()`. */
    since: number;
    className?: string;
}) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const tick = () => setNow(Date.now());
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [since]);
    return (
        <span role="timer" className={classes("tabular-nums", className)}>
            {elapsedText(now - since)}
        </span>
    );
}
