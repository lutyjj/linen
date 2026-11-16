import { useLayoutEffect, useRef } from "react";

/**
 * A value that changes on its own: anything with a `subscribe` that hands
 * its listener the value at once and then each new one, and returns how to
 * stop, as a Preact signal does.
 */
export interface Readable<Value> {
    subscribe: (listener: (value: Value) => void) => () => void;
}

/** A value given once, or one that changes on its own. */
export type Live<Value> = Value | Readable<Value>;

export function isReadable<Value>(
    value: Live<Value>,
): value is Readable<Value> {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as Readable<Value>).subscribe === "function"
    );
}

/**
 * Follows a live value without rendering: each new value is written where
 * it shows, so a value that changes many times a second costs no render of
 * the part that shows it or of anything around it. A render, such as one
 * that changes the scale, writes the last value again the new way.
 */
export function useFollow(value: Live<number>, write: (value: number) => void) {
    const writer = useRef(write);
    writer.current = write;
    const last = useRef<number | undefined>(undefined);
    useLayoutEffect(() => {
        if (last.current !== undefined) writer.current(last.current);
    });
    useLayoutEffect(() => {
        const follow = (next: number) => {
            last.current = next;
            writer.current(next);
        };
        if (!isReadable(value)) {
            follow(value);
            return;
        }
        return value.subscribe(follow);
    }, [value]);
}
