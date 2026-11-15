import { m } from "motion/react";
import { useMemo } from "react";

import { spring, useStill } from "./tokens";

/**
 * The mark behind the chosen one of a group's options, which travels to the
 * next one chosen: "this moved from there".
 *
 * It is drawn inside the chosen option, and every mark in a group shares one
 * layout id, so choosing another option moves the mark rather than replacing
 * it. Motion carries it there with a transform, and keeps its corners round
 * while it stretches, which is why the radius is stated on the element.
 *
 * Every option of the group wears `chosenLayerClass`, or the mark paints over
 * the options it slides across; the group is `isolate`, so those layers stay
 * inside it.
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
 * The layer each option of a group with a chosen mark stands on. The mark is
 * drawn inside the chosen option, so on its way from an earlier option it
 * would paint over the words of every option it passes; the chosen option
 * stands beneath the others, and the mark slides under them. Put `isolate`
 * on the group, so these layers stay inside it.
 */
export function chosenLayerClass(chosen: boolean): string {
    return chosen ? "z-0" : "z-1";
}

/**
 * An option's own words, at the width they take when chosen. The chosen
 * option is set a weight heavier, and a label that widened as it was chosen
 * would move every option after it.
 */
export const CHOSEN_WIDTH_CLASS =
    "after:invisible after:block after:h-0 after:overflow-hidden after:font-medium after:content-[attr(data-label)]";
