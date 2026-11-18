import type { ReactNode } from "react";

import { classes } from "../foundation/classes";

/** A key on the keyboard, as a shortcut names it. */
export function Kbd({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <kbd
            className={classes(
                "rounded-input border border-b-2 border-border-strong bg-surface px-1 py-px font-mono text-2xs text-text-secondary",
                className,
            )}
        >
            {children}
        </kbd>
    );
}
