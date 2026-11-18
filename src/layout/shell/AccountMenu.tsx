import { Popover } from "@base-ui/react/popover";
import { ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { classes } from "../../foundation/classes";
import {
    OPEN_TRIGGER_CLASS,
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../../foundation/popup";
import { isContent } from "../../foundation/slot";
import { railItemClass, useRailCompact } from "./Rail";

/**
 * Who is signed in, and what they have chosen for this browser, with the way
 * out under it.
 *
 * One control at the foot of the rail rather than loose ones: it reads as the
 * person, and opening it shows what belongs to them. A shared machine's next
 * person looks for their own name to leave by, and finds the way out under
 * it. A phone has no rail, so the app's settings hold the same choices and
 * the way out.
 */
export function AccountMenu({
    name,
    caption,
    label,
    menuLabel,
    children,
    footer,
}: {
    name: string;
    /** A line under the name in the menu, such as how the person signs in. */
    caption?: ReactNode;
    /** The trigger's name, which says who is signed in. */
    label: string;
    /** The menu's own name. */
    menuLabel: string;
    /** The choices, each a `MenuChoice`. */
    children?: ReactNode;
    /** The way out. */
    footer?: ReactNode;
}) {
    const compact = useRailCompact();
    const initial = name.slice(0, 1).toUpperCase();
    return (
        <Popover.Root>
            <Popover.Trigger
                render={<button />}
                aria-label={label}
                className={classes(
                    railItemClass(false),
                    OPEN_TRIGGER_CLASS,
                    "h-10",
                    compact ? "justify-center px-0" : "pl-1",
                )}
            >
                <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-weak text-xs font-semibold text-accent"
                >
                    {initial}
                </span>
                {!compact && (
                    <>
                        <span className="min-w-0 flex-1 truncate font-medium text-text">
                            {name}
                        </span>
                        <ChevronsUpDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                        />
                    </>
                )}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    side={compact ? "right" : "top"}
                    align={compact ? "end" : "start"}
                    sideOffset={8}
                    className={POSITIONER_CLASS}
                >
                    <Popover.Popup
                        render={renderLeaving}
                        aria-label={menuLabel}
                        className={classes(POPUP_CLASS, "w-64 p-0")}
                    >
                        <Popover.Arrow className="absolute" />
                        <div className="border-b border-border px-3 py-2.5">
                            <div className="truncate text-sm font-medium">
                                {name}
                            </div>
                            {isContent(caption) && (
                                <div className="text-xs text-text-muted">
                                    {caption}
                                </div>
                            )}
                        </div>
                        {isContent(children) && (
                            <div className="flex flex-col gap-3 px-3 py-3">
                                {children}
                            </div>
                        )}
                        {isContent(footer) && (
                            <div className="border-t border-border p-2">
                                {footer}
                            </div>
                        )}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/** A choice inside the account menu, under the word for what it chooses. */
export function MenuChoice({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={classes(
                "flex flex-col gap-1.5 [&_[role=radio]]:flex-1 [&>[role=radiogroup]]:flex",
                className,
            )}
        >
            <span aria-hidden="true" className="text-xs text-text-secondary">
                {label}
            </span>
            {children}
        </div>
    );
}
