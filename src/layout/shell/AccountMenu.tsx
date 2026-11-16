import { Popover } from "@base-ui/react/popover";
import { ChevronsUpDown } from "lucide-react";
import { type ReactNode, use } from "react";

import { classes } from "../../foundation/classes";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../../foundation/popup";
import { TAB_CELL_CLASS } from "./places";
import { FootPlaceContext, railItemClass, useRailCompact } from "./Rail";

/**
 * Who is signed in, and what they have chosen for this browser, with the way
 * out under it.
 *
 * One control at the foot of the rail rather than loose ones: it reads as the
 * person, and opening it shows what belongs to them. A shared machine's next
 * person looks for their own name to leave by, and finds the way out under
 * it. It draws itself for where the foot stands: a row in the rail, its
 * mark alone at the end of a phone's top bar, and a cell like a place's in
 * the tab bar.
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
    const place = use(FootPlaceContext);
    const initial = name.slice(0, 1).toUpperCase();
    // In the rail it is a row; at the end of a phone's top bar, the mark
    // alone; in the tab bar, a cell like a place's, its mark over the name.
    const trigger = {
        rail: classes(
            railItemClass(false),
            "h-10",
            compact ? "justify-center px-0" : "pl-1",
        ),
        top: "flex size-(--height-control) cursor-pointer items-center justify-center rounded-full",
        bottom: classes(TAB_CELL_CLASS, "cursor-pointer text-text-secondary"),
    }[place];
    const side = {
        rail: compact ? "right" : "top",
        top: "bottom",
        bottom: "top",
    } as const;
    const align = {
        rail: compact ? "end" : "start",
        top: "end",
        bottom: "end",
    } as const;
    return (
        <Popover.Root>
            <Popover.Trigger
                render={<button />}
                aria-label={label}
                className={classes(
                    trigger,
                    "data-[popup-open]:bg-border data-[popup-open]:text-text",
                )}
            >
                <span
                    aria-hidden="true"
                    className={classes(
                        "flex shrink-0 items-center justify-center rounded-full bg-accent-weak text-xs font-semibold text-accent",
                        place === "bottom" ? "size-6" : "size-7",
                    )}
                >
                    {initial}
                </span>
                {place === "bottom" && (
                    <span
                        aria-hidden="true"
                        className="max-w-full truncate px-1"
                    >
                        {name}
                    </span>
                )}
                {place === "rail" && !compact && (
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
                    side={side[place]}
                    align={align[place]}
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
                            {caption !== undefined && (
                                <div className="text-xs text-text-muted">
                                    {caption}
                                </div>
                            )}
                        </div>
                        {children !== undefined && (
                            <div className="flex flex-col gap-3 px-3 py-3">
                                {children}
                            </div>
                        )}
                        {footer !== undefined && (
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
