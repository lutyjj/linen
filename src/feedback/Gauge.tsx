import {
    createContext,
    type CSSProperties,
    type ReactNode,
    use,
    useId,
    useLayoutEffect,
    useRef,
} from "react";

import { classes } from "../foundation/classes";
import type { Tone } from "../foundation/tone";

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

function isReadable<Value>(value: Live<Value>): value is Readable<Value> {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as Readable<Value>).subscribe === "function"
    );
}

/** A stretch of the scale that means something, such as too loud. */
export interface GaugeZone {
    from: number;
    to: number;
    tone: Tone;
}

/**
 * A point on the scale worth seeing beside the value: one the value has
 * reached and is held at, such as a peak, or one set beforehand, such as a
 * threshold.
 */
export interface GaugeMark {
    value: Live<number>;
    kind: "held" | "set";
    /** What it is, for a reader who cannot see it. */
    label: string;
}

const ZONE_INK: Record<Tone, string> = {
    accent: "var(--color-accent)",
    positive: "var(--color-positive)",
    warn: "var(--color-warn)",
    danger: "var(--color-danger)",
};

const ZONE_TINT: Record<Tone, string> = {
    accent: "var(--color-accent-weak)",
    positive: "var(--color-positive-weak)",
    warn: "var(--color-warn-weak)",
    danger: "var(--color-danger-weak)",
};

/**
 * A layer across the scale, each zone in its colour and the rest in `rest`:
 * always an image, so it can stand in `background-image`.
 */
function stripes(
    zones: readonly GaugeZone[],
    at: (value: number) => number,
    colour: Record<Tone, string>,
    rest: string,
): string {
    if (zones.length === 0) return `linear-gradient(${rest}, ${rest})`;
    const stops: string[] = [];
    let reached = 0;
    for (const zone of [...zones].sort((one, other) => one.from - other.from)) {
        const from = at(zone.from) * 100;
        const to = at(zone.to) * 100;
        if (from > reached) stops.push(`${rest} ${reached}% ${from}%`);
        stops.push(`${colour[zone.tone]} ${from}% ${to}%`);
        reached = to;
    }
    if (reached < 100) stops.push(`${rest} ${reached}% 100%`);
    return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * Follows a live value without rendering: each new value is written where
 * it shows, so a value that changes many times a second costs no render of
 * the gauge or of anything around it. A render, such as one that changes
 * the scale, writes the last value again the new way.
 */
function useFollow(value: Live<number>, write: (value: number) => void) {
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

function Mark({
    mark,
    at,
}: {
    mark: GaugeMark;
    at: (value: number) => number;
}) {
    const place = useRef<HTMLSpanElement>(null);
    useFollow(mark.value, (value) => {
        place.current?.style.setProperty("--at", String(at(value)));
    });
    return (
        <span
            ref={place}
            aria-hidden="true"
            className="absolute inset-0 translate-x-[calc(var(--at,0)*100%)]"
        >
            <span
                className={classes(
                    "absolute inset-y-0 left-0 w-0.5 -translate-x-1/2",
                    mark.kind === "held" ? "bg-text" : "bg-text-muted",
                )}
            />
        </span>
    );
}

/**
 * A value on a bounded scale, such as a level, a load or a fill: its name,
 * a bar that fills toward the end of the scale, and the value in words.
 * The bar wears the colour of each zone it reaches, and marks stand on it
 * where the value was held or where a threshold is set. It is a meter to
 * assistive technology.
 *
 * A value that changes on its own (`Readable`) is followed without
 * rendering, so a gauge can follow a value many times a second inside a
 * screen that does not render for it. Two or more read together stand in
 * `Gauges`.
 */
export function Gauge({
    label,
    value,
    min = 0,
    max = 1,
    zones = [],
    marks = [],
    format = (number) => String(Math.round(number)),
    className,
}: {
    /** What it measures, beside the bar and as the meter's name. */
    label: ReactNode;
    value: Live<number>;
    min?: number;
    max?: number;
    zones?: readonly GaugeZone[];
    marks?: readonly GaugeMark[];
    /** The value in words, as it is shown and read out, such as `-12 dB`. */
    format?: (value: number) => string;
    className?: string;
}) {
    const name = useId();
    const lined = use(InRows);
    const meter = useRef<HTMLDivElement>(null);
    const words = useRef<HTMLSpanElement>(null);
    const at = (number: number) =>
        Math.min(1, Math.max(0, (number - min) / (max - min || 1)));
    useFollow(value, (number) => {
        const element = meter.current;
        if (element === null) return;
        element.style.setProperty("--level", String(at(number)));
        element.setAttribute("aria-valuenow", String(number));
        element.setAttribute("aria-valuetext", format(number));
        if (words.current !== null) words.current.textContent = format(number);
    });
    const style = {
        "--fill": stripes(zones, at, ZONE_INK, "var(--color-accent)"),
        "--track": stripes(zones, at, ZONE_TINT, "var(--color-sunken)"),
    } as CSSProperties;
    // The words take the room of the widest value the scale can show, so
    // the bar keeps its length as they change.
    const room = Math.max(format(min).length, format(max).length);
    const gauge = (
        <div
            ref={meter}
            role="meter"
            aria-labelledby={name}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={isReadable(value) ? undefined : value}
            aria-valuetext={isReadable(value) ? undefined : format(value)}
            style={style}
            className={classes(
                "grid grid-cols-subgrid col-span-3 items-center text-xs",
                className,
            )}
        >
            <span id={name} className="text-text-secondary">
                {label}
            </span>
            <span className="relative h-2 overflow-hidden rounded-full bg-(image:--track)">
                <span className="absolute inset-0 bg-(image:--fill) [clip-path:inset(0_calc((1_-_var(--level,0))_*_100%)_0_0)]" />
                {marks.map((mark, index) => (
                    <Mark key={index} mark={mark} at={at} />
                ))}
            </span>
            <span
                ref={words}
                aria-hidden="true"
                style={{ minWidth: `${room}ch` }}
                className="text-right text-text tabular-nums"
            />
        </div>
    );
    return lined ? gauge : <GaugeRows>{gauge}</GaugeRows>;
}

/**
 * Gauges read together, such as two channels of one signal: one name over
 * them, the bars stacked close and lined up, their names in one column and
 * their values in another.
 */
export function Gauges({
    label,
    className,
    children,
}: {
    label: ReactNode;
    className?: string;
    /** Each a `Gauge`. */
    children: ReactNode;
}) {
    const name = useId();
    return (
        <div role="group" aria-labelledby={name} className={className}>
            <div id={name} className="mb-1.5 text-xs font-medium">
                {label}
            </div>
            <GaugeRows>{children}</GaugeRows>
        </div>
    );
}

/** Whether a gauge stands in rows it shares with others. */
const InRows = createContext(false);

/** The grid gauges line up in, alone or together. */
function GaugeRows({ children }: { children: ReactNode }) {
    return (
        <InRows value={true}>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1">
                {children}
            </div>
        </InRows>
    );
}
