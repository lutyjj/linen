import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { m } from "motion/react";
import { useId, useMemo } from "react";

import { classes } from "./classes";
import { spring, useStill } from "./motion";

/**
 * The mark behind the chosen one of a group's options, which travels to the
 * next one chosen: "this moved from there".
 *
 * It is drawn inside the chosen option, and every mark in a group shares one
 * layout id, so choosing another option moves the mark rather than replacing
 * it. Motion carries it there with a transform, and keeps its corners round
 * while it stretches, which is why the radius is stated on the element.
 */
export function ChosenMark({
    group,
    radius,
}: {
    /** The group's own id, so two groups on a screen keep two marks. */
    group: string;
    /** The radius token of the options it sits behind. */
    radius: "input" | "button";
}) {
    const still = useStill();
    const borderRadius = useMemo(
        () =>
            getComputedStyle(document.documentElement).getPropertyValue(
                `--radius-${radius}`,
            ),
        [radius],
    );
    return (
        <m.span
            layoutId={still ? undefined : `${group}-chosen`}
            transition={spring("state")}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-accent-weak"
            style={{ borderRadius }}
        />
    );
}

/**
 * An option's own words, at the width they take when chosen. The chosen
 * option is set a weight heavier, and a label that widened as it was chosen
 * would move every option after it.
 */
export const CHOSEN_WIDTH_CLASS =
    "after:invisible after:block after:h-0 after:overflow-hidden after:font-medium after:content-[attr(data-label)]";

/**
 * One value out of a few, each a word or two: a theme, a scale, a hue. A
 * radio group underneath, so it is one stop on the Tab key and the arrow keys
 * move the choice, as assistive technology announces it.
 */
export function SegmentedControl<Value extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    /** Undefined where nothing is chosen yet, which no option answers to. */
    value: Value | undefined;
    options: readonly { value: Value; label: string }[];
    onChange: (value: Value) => void;
}) {
    const group = useId();
    return (
        <RadioGroup
            aria-label={label}
            value={value ?? null}
            onValueChange={(next) => {
                if (next !== value) onChange(next as Value);
            }}
            className="relative inline-flex h-(--height-control) shrink-0 items-stretch rounded-button border border-border-strong bg-surface p-0.5"
        >
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <Radio.Root
                        key={option.value}
                        value={option.value}
                        data-label={option.label}
                        className={classes(
                            "relative flex cursor-pointer flex-col items-center justify-center rounded-input px-2 text-sm",
                            CHOSEN_WIDTH_CLASS,
                            active
                                ? "font-medium text-accent"
                                : "text-text-secondary hover:text-text",
                        )}
                    >
                        {active && <ChosenMark group={group} radius="input" />}
                        <span className="relative">{option.label}</span>
                    </Radio.Root>
                );
            })}
        </RadioGroup>
    );
}
