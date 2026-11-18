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
import { useWords } from "../foundation/words";
import { type Live, useFollow } from "./live";

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
    /**
     * What it is, read out before its value after the gauge's, such as
     * `Peak` in `-12 dB, Peak -3 dB`.
     */
    label: string;
}

/**
 * Whether a mark stands on the bar at a share of the scale: a value held at
 * the lowest reached nothing, so it draws nothing and is not read out, as the
 * fill at its lowest is empty.
 */
function stands(mark: GaugeMark, share: number): boolean {
    return mark.kind === "set" || share > 0;
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
 * its lowest; a set point is a thin line that stands past the bar's edges. In
 * a compact bar both stay inside it.
 *
 * Each mark moves on a transform, so a value it follows many times a second
 * costs no layout: a box narrower than the scale by the mark's width slides
 * by the share of it the value has reached, so the mark stands whole inside
 * the bar at either end of the scale, and the bar clips the box where it
 * slides past the bar's end. A held block leaves and returns at the lowest
 * by its visibility, which costs no layout either. Each value it follows is
 * handed on to `heard`, so the gauge reads it out.
 */
function Mark({
    mark,
    at,
    small,
    heard,
}: {
    mark: GaugeMark;
    at: (value: number) => number;
    small: boolean;
    heard: (value: number) => void;
}) {
    const place = useRef<HTMLSpanElement>(null);
    const held = mark.kind === "held";
    useFollow(mark.value, (value) => {
        const element = place.current;
        if (element === null) return;
        element.style.setProperty("--at", String(at(value)));
        element.style.visibility = stands(mark, at(value)) ? "" : "hidden";
        heard(value);
    });
    return (
        <span
            ref={place}
            aria-hidden="true"
            className={classes(
                "pointer-events-none absolute inset-y-0 left-0 translate-x-[calc(var(--at,0)*100%)]",
                held && !small ? "right-1" : "right-0.5",
            )}
        >
            <span
                className={classes(
                    "absolute inset-y-0 left-0",
                    held
                        ? classes("bg-text", small ? "w-0.5" : "w-1")
                        : classes(
                              "w-0.5 rounded-full bg-text-muted",
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
 * assistive technology, whose value in words names the marks on the bar.
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
    /**
     * The value in words, as it is shown and read out, such as `-12 dB`;
     * each mark's value is said the same way.
     */
    format?: (value: number) => string;
    /** Alone, the bar for a row of a list; in `Gauges`, theirs decides. */
    compact?: boolean;
    className?: string;
}) {
    const name = useId();
    const rows = use(InRows);
    const small = rows === null ? compact : rows === "compact";
    const words = useWords();
    const meter = useRef<HTMLDivElement>(null);
    const shown = useRef<HTMLSpanElement>(null);
    // The last value followed and each mark's, so that a change to any of
    // them reads all of them out again.
    const followed = useRef<{ value?: number; marks: (number | undefined)[] }>({
        marks: [],
    });
    const at = (number: number) =>
        Math.min(1, Math.max(0, (number - min) / (max - min || 1)));
    const readOut = () => {
        const number = followed.current.value;
        if (number === undefined) return;
        const said = marks.flatMap((mark, index) => {
            const reached = followed.current.marks[index];
            return reached === undefined || !stands(mark, at(reached))
                ? []
                : [{ label: mark.label, value: format(reached) }];
        });
        meter.current?.setAttribute(
            "aria-valuetext",
            words.gaugeReading(format(number), said),
        );
    };
    useFollow(value, (number) => {
        const element = meter.current;
        if (element === null) return;
        followed.current.value = number;
        element.style.setProperty("--level", String(at(number)));
        element.setAttribute("aria-valuenow", String(number));
        if (shown.current !== null) shown.current.textContent = format(number);
        readOut();
    });
    const heard = (index: number) => (number: number) => {
        followed.current.marks[index] = number;
        readOut();
    };
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
                marks stand over it, after them. The bar clips its sides, so
                the boxes the marks travel in reach past neither end, and a
                full bar's set marks pass its top and bottom; a compact bar
                clips them to its rounded ends, as the track does its held
                marks. No mark takes a pointer. */}
            <span
                className={classes(
                    "relative block",
                    small
                        ? "h-1 overflow-hidden rounded-full"
                        : "h-3 overflow-x-clip",
                )}
            >
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
                                    heard={heard(index)}
                                />
                            ),
                    )}
                </span>
                {marks.map(
                    (mark, index) =>
                        mark.kind === "set" && (
                            <Mark
                                key={index}
                                mark={mark}
                                at={at}
                                small={small}
                                heard={heard(index)}
                            />
                        ),
                )}
            </span>
            {!small && (
                <span
                    ref={shown}
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
                        ? "flex flex-col gap-2"
                        : "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
                }
            >
                {children}
            </div>
        </InRows>
    );
}
