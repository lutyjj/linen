import type { ReactNode } from "react";

import { CopyButton } from "../controls/CopyValue";
import { classes } from "../foundation/classes";

/**
 * Names and their values, read and not changed: what a thing is, at a
 * glance. Each name starts its line and its value ends it, where a setting's
 * control stands, so the values in a card share one edge with its controls,
 * and a hairline between facts keeps a value with its name across a wide
 * card. A value too long to stand beside its name goes under it, with its
 * copy control beside it.
 */
export function Facts({
    className,
    children,
}: {
    className?: string;
    /** Each a `Fact`. */
    children: ReactNode;
}) {
    return (
        <dl className={classes("flex flex-col text-sm", className)}>
            {children}
        </dl>
    );
}

/**
 * One name and its value. A value typed or copied exactly, such as an
 * address or a key, is `mono`; `copy` puts it on the clipboard whole.
 */
export function Fact({
    name,
    mono = false,
    copy,
    className,
    children,
}: {
    name: ReactNode;
    mono?: boolean;
    /** What the copy control takes, and its name for it. */
    copy?: { value: string; label: string };
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={classes(
                "flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border py-2 first:border-t-0 first:pt-0 last:pb-0",
                className,
            )}
        >
            <dt className="text-text-secondary">{name}</dt>
            <dd className="flex min-h-(--height-control-inline) min-w-0 items-center gap-x-2">
                <span
                    className={classes(
                        "min-w-0 wrap-anywhere",
                        mono && "font-mono text-xs/5",
                    )}
                >
                    {children}
                </span>
                {copy !== undefined && (
                    <CopyButton
                        value={copy.value}
                        label={copy.label}
                        className="h-(--height-control-inline)"
                    />
                )}
            </dd>
        </div>
    );
}
