import {
    createContext,
    type CSSProperties,
    type ReactNode,
    use,
    useId,
    useRef,
} from "react";

import { classes } from "../foundation/classes";
import type { Tone } from "../foundation/tone";
import { isReadable, type Live, useFollow } from "./live";

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

/**
 * The fill's layer across the scale, each zone in its ink and the rest in
 * `rest`: always an image, so it can stand in `background-image`.
 */
function stripes(
    zones: readonly GaugeZone[],
    at: (value: number) => number,
    rest: string,
): string {
    if (zones.length === 0) return `linear-gradient(${rest}, ${rest})`;
    const stops: string[] = [];
    let reached = 0;
    for (const zone of [...zones].sort((one, other) => one.from - other.from)) {
        const from = at(zone.from) * 100;
        const to = at(zone.to) * 100;
        if (from > reached) stops.push(`${rest} ${reached}% ${from}%`);
        stops.push(`${ZONE_INK[zone.tone]} ${from}% ${to}%`);
        reached = to;
    }
    if (reached < 100) stops.push(`${rest} ${reached}% 100%`);
    return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * Held and set marks differ in shape, so they read apart where they stand
 * close: a held value is a block inside the bar, in the text's ink, that
 * takes the bar's rounded end at the top of the scale and draws nothing at
 * its lowest, where the value reached nothing, as the fill does; a set point
 * is a thin line that stands past the bar's edges. In a compact bar both stay
 * inside it.
 *
 * Each mark moves on a transform, so a value it follows many times a second
 * costs no layout: a box as wide as the scale the block can travel slides by
 * the share of it the value has reached, and its parent clips what slides
 * past the bar. A held block leaves and returns at the lowest by its
 * visibility, which costs no layout either.
 */
function Mark({
    mark,
    at,
    small,
}: {
    mark: GaugeMark;
    at: (value: number) => number;
    small: boolean;
}) {
    const place = useRef<HTMLSpanElement>(null);
    const held = mark.kind === "held";
    useFollow(mark.value, (value) => {
        const element = place.current;
        if (element === null) return;
        element.style.setProperty("--at", String(at(value)));
        if (held) element.style.visibility = at(value) === 0 ? "hidden" : "";
    });
    return (
        <span
            ref={place}
            aria-hidden="true"
            className={classes(
                "absolute inset-y-0 left-0 translate-x-[calc(var(--at,0)*100%)]",
                held ? (small ? "right-0.5" : "right-1") : "right-0",
            )}
        >
            <span
                className={classes(
                    "absolute inset-y-0 left-0",
                    held
                        ? classes("bg-text", small ? "w-0.5" : "w-1")
                        : classes(
                              "w-0.5 -translate-x-1/2 rounded-full bg-text-muted",
                              !small && "-my-1",
                          ),
                )}
            />
        </span>
    );
}

/**
 * A value on a bounded scale, such as a level, a load or a fill: its name,
 * a bar that fills toward the end of the scale, and the value in words.
 * The bar wears the ink of each zone it reaches, and marks stand on it
 * where the value was held or where a threshold is set. It is a meter to
 * assistive technology.
 *
 * A value that changes on its own (`Readable`) is followed without
 * rendering, so a gauge can follow a value many times a second inside a
 * screen that does not render for it. Two or more read together stand in
 * `Gauges`. A `compact` gauge, for a row of a list, is its bar alone, thin;
 * its name and its value in words are the meter's, read out but not shown.
 */
export function Gauge({
    label,
    value,
    min = 0,
    max = 1,
    zones = [],
    marks = [],
    format = (number) => String(Math.round(number)),
    compact = false,
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
    /** Alone, the bar for a row of a list; in `Gauges`, theirs decides. */
    compact?: boolean;
    className?: string;
}) {
    const name = useId();
    const rows = use(InRows);
    const small = rows === null ? compact : rows === "compact";
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
        "--fill": stripes(zones, at, "var(--color-accent)"),
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
                small
                    ? "block"
                    : "grid grid-cols-subgrid col-span-3 items-center text-sm",
                className,
            )}
        >
            <span
                id={name}
                className={small ? "sr-only" : "text-text-secondary"}
            >
                {label}
            </span>
            {/* The track is the scale, empty; only the fill, in the ink of
                each zone it reaches, is the value, so a gauge at its lowest
                reads as empty. Held marks lie inside the track's clip; set
                marks stand over it in a layer that clips only its sides, so
                they pass the track's top and bottom and nothing reaches past
                its ends. No mark takes a pointer. */}
            <span className={classes("relative block", small ? "h-1" : "h-3")}>
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-border">
                    <span className="absolute inset-0 bg-(image:--fill) [clip-path:inset(0_calc((1_-_var(--level,0))_*_100%)_0_0)]" />
                    {marks.map(
                        (mark, index) =>
                            mark.kind === "held" && (
                                <Mark
                                    key={index}
                                    mark={mark}
                                    at={at}
                                    small={small}
                                />
                            ),
                    )}
                </span>
                {marks.some((mark) => mark.kind === "set") && (
                    <span className="pointer-events-none absolute inset-0 overflow-x-clip">
                        {marks.map(
                            (mark, index) =>
                                mark.kind === "set" && (
                                    <Mark
                                        key={index}
                                        mark={mark}
                                        at={at}
                                        small={small}
                                    />
                                ),
                        )}
                    </span>
                )}
            </span>
            {!small && (
                <span
                    ref={words}
                    aria-hidden="true"
                    style={{ minWidth: `${room}ch` }}
                    className="text-right font-medium text-text tabular-nums"
                />
            )}
        </div>
    );
    return rows === null ? (
        <GaugeRows compact={small}>{gauge}</GaugeRows>
    ) : (
        gauge
    );
}

/**
 * Gauges read together, such as two channels of one signal: one name over
 * them, the bars stacked close and lined up, their names in one column and
 * their values in another. `compact` stacks the bars alone, for a row of a
 * list, and keeps the names for assistive technology.
 */
export function Gauges({
    label,
    compact = false,
    className,
    children,
}: {
    label: ReactNode;
    compact?: boolean;
    className?: string;
    /** Each a `Gauge`. */
    children: ReactNode;
}) {
    const name = useId();
    return (
        <div role="group" aria-labelledby={name} className={className}>
            <div
                id={name}
                className={compact ? "sr-only" : "mb-2 text-sm font-medium"}
            >
                {label}
            </div>
            <GaugeRows compact={compact}>{children}</GaugeRows>
        </div>
    );
}

/** The rows a gauge stands in, if any, and how small. */
const InRows = createContext<"full" | "compact" | null>(null);

/** The grid gauges line up in, alone or together. */
function GaugeRows({
    compact,
    children,
}: {
    compact: boolean;
    children: ReactNode;
}) {
    return (
        <InRows value={compact ? "compact" : "full"}>
            <div
                className={
                    compact
                        ? "flex flex-col gap-0.5"
                        : "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5"
                }
            >
                {children}
            </div>
        </InRows>
    );
}
