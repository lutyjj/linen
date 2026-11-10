import { m } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { NavLink, useLocation } from "react-router";

import { classes } from "./classes";
import { CHOSEN_WIDTH_CLASS, ChosenMark } from "./SegmentedControl";
import { COLUMN_CLASS } from "./TopBar";

export interface Section {
    to: string;
    label: string;
}

/**
 * Secondary navigation inside one screen: a rail of sections, one concern each.
 *
 * A few top-level screens, none more than two deep, need no breadcrumbs. Where
 * a screen holds more than one concern, this is the hierarchy: the sidebar says
 * which screen, this says which part of it, and the two together are the whole
 * of "where am I".
 *
 * Each section is a route rather than an anchor, so it is linkable, it survives
 * a reload, and the browser's back button steps through the sections a person
 * actually visited.
 */
export function SectionNav({
    label,
    sections,
}: {
    /** Names this rail, since a screen's sidebar is a navigation too. */
    label: string;
    sections: readonly Section[];
}) {
    const marks = useId();
    const group = useRef<HTMLDivElement>(null);
    const { pathname } = useLocation();
    useEffect(() => {
        group.current
            ?.querySelector("[aria-current=page]")
            ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [group, pathname]);
    return (
        <nav
            aria-label={label}
            className="sticky top-[calc(var(--inset-top)+var(--height-topbar,var(--height-toolbar)))] z-4 border-b border-border bg-bg"
        >
            {/* A single scrolling rail on phones; wider layouts can wrap. */}
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
                    className="relative flex min-h-[var(--height-sections)] w-max min-w-full flex-nowrap items-center gap-1 py-1.5 md:w-auto md:flex-wrap"
                >
                    {sections.map((section) => (
                        <NavLink
                            key={section.to}
                            to={section.to}
                            data-label={section.label}
                            className={({ isActive }) =>
                                classes(
                                    "relative flex shrink-0 flex-col items-center rounded-button px-2.5 py-1.5 text-sm whitespace-nowrap ",
                                    CHOSEN_WIDTH_CLASS,
                                    isActive
                                        ? "font-medium text-accent"
                                        : "text-text-secondary hover:bg-border hover:text-text",
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <ChosenMark
                                            group={marks}
                                            radius="button"
                                        />
                                    )}
                                    <span className="relative">
                                        {section.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </m.div>
        </nav>
    );
}
