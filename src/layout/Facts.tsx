import type { ReactNode } from "react";

import { CopyButton } from "../controls/CopyValue";
import { classes } from "../foundation/classes";

/**
 * Names and their values, read and not changed: what a thing is, at a
 * glance. The names stand in one column and the values in the next while
 * the list has room, the value under its name once it does not.
 */
export function Facts({
    className,
    children,
}: {
    className?: string;
    /** Each a `Fact`. */
    children: ReactNode;
}) {
    // The list asks how wide its box is, which a grid cannot ask of itself.
    return (
        <div className={classes("@container", className)}>
            <dl className="grid grid-cols-1 gap-y-1 text-sm @min-[26rem]:grid-cols-[minmax(0,auto)_minmax(0,1fr)] @min-[26rem]:gap-x-6 @min-[26rem]:gap-y-2">
                {children}
            </dl>
        </div>
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
    children,
}: {
    name: ReactNode;
    mono?: boolean;
    /** What the copy control takes, and its name for it. */
    copy?: { value: string; label: string };
    children: ReactNode;
}) {
    return (
        <div className="contents">
            <dt className="text-text-secondary">{name}</dt>
            <dd className="mb-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 @min-[26rem]:mb-0">
                <span
                    className={classes(
                        "min-w-0 break-words",
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
