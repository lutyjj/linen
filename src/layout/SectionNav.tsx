import { m } from "motion/react";
import { useEffect, useId, useRef } from "react";

import { classes } from "../foundation/classes";
import { COLUMN_CLASS } from "../foundation/column";
import { useStickyBar } from "../foundation/viewport";
import {
    CHOSEN_WIDTH_CLASS,
    chosenLayerClass,
    ChosenMark,
} from "../motion/ChosenMark";
import { useCurrent, useNavigation } from "../navigation/navigation";
import { placeClass } from "./shell/places";

export interface Section {
    /** A path from the root, such as `/settings/people`. */
    href: string;
    label: string;
    /** Where the section is current only on its own address, as a screen's
     * first section at the screen's own address is. */
    exact?: boolean;
}

/**
 * Secondary navigation inside one screen: its sections, one concern each, in
 * a bar under the top bar. Where a screen holds more than one concern, the
 * shell's places say which screen and this says which part of it; a screen
 * beneath another names the screens above it in its top bar's trail.
 *
 * Each section is a route rather than an anchor, so it is linkable, it survives
 * a reload, and the browser's back button steps through the sections a person
 * actually visited.
 */
export function SectionNav({
    label,
    sections,
    className,
}: {
    /** Names these sections apart from the shell's places, a navigation too. */
    label: string;
    sections: readonly Section[];
    className?: string;
}) {
    const marks = useId();
    const group = useRef<HTMLDivElement>(null);
    // Its height, for what scrolls beneath it.
    const rail = useStickyBar<HTMLElement>("--height-sectionnav");
    const pathname = useNavigation().usePathname();
    useEffect(() => {
        group.current
            ?.querySelector("[aria-current=page]")
            ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [group, pathname]);
    return (
        <nav
            ref={rail}
            aria-label={label}
            className={classes(
                "sticky top-[calc(var(--inset-top)+var(--height-conditions,0px)+var(--height-topbar,0px))] z-4 border-b border-border bg-bg",
                className,
            )}
        >
            {/* One row that scrolls on a phone; wider screens wrap. */}
            {/* It scrolls, so Motion is told to measure the mark inside it
                rather than as though the scroll had moved it. */}
            <m.div
                layoutScroll
                className={classes(COLUMN_CLASS, "overflow-x-auto")}
            >
                {/* As wide as its sections, so the mark reaches the ones a
                    phone has to scroll to. */}
                <div
                    ref={group}
                    className="relative isolate flex min-h-[var(--height-sections)] w-max min-w-full flex-nowrap items-center gap-1 py-1.5 md:w-auto md:flex-wrap"
                >
                    {sections.map((section) => (
                        <SectionLink
                            key={section.href}
                            {...section}
                            marks={marks}
                        />
                    ))}
                </div>
            </m.div>
        </nav>
    );
}

/** A section, which wears the chosen mark while it is current. */
function SectionLink({
    href,
    label,
    exact = false,
    marks,
}: Section & {
    /** The bar's own id, which its chosen mark travels within. */
    marks: string;
}) {
    const { Link } = useNavigation();
    const current = useCurrent(href, exact);
    return (
        <Link
            href={href}
            data-label={label}
            aria-current={current ? "page" : undefined}
            className={classes(
                placeClass(current),
                "relative shrink-0 flex-col justify-center gap-0 whitespace-nowrap",
                CHOSEN_WIDTH_CLASS,
                chosenLayerClass(current),
            )}
        >
            {current && <ChosenMark group={marks} radius="button" />}
            <span className="relative">{label}</span>
        </Link>
    );
}
