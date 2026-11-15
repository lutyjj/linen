import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import { COLUMN_CLASS } from "../foundation/column";

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
