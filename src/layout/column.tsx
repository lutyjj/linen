import type { ReactNode } from "react";

import { classes } from "../foundation/classes";

/**
 * The one content column, centred, and the class every band of chrome aligns
 * itself to.
 *
 * A screen is a stack of full-bleed bands (the top bar, the section rail, the
 * content), and each one puts its contents in this column, so a title, a
 * toolbar button, and the table beneath them share a left and a right edge at
 * every window width.
 */
export const COLUMN_CLASS =
    "mx-auto w-full max-w-[var(--width-content)] px-3 md:px-5";

/**
 * The column of a screen that works across the whole width, such as an editor
 * beside its preview. Its bands still share their edges.
 */
export const WIDE_COLUMN_CLASS = "w-full px-3 md:px-5";

/**
 * The voice a screen names itself in: the display face, which belongs to the
 * wordmark and a screen's title and to nothing else. A screen outside the
 * shell, such as signing in, carries no top bar and still speaks in it.
 */
export const SCREEN_TITLE_CLASS =
    "font-display text-lg font-semibold tracking-[-0.01em]";

/** A screen's content, in the column, under its bars. */
export function Content({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={classes(COLUMN_CLASS, "py-3 md:py-5", className)}>
            {children}
        </div>
    );
}
