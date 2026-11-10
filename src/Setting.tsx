import { type ReactNode, useId } from "react";

import { classes } from "./classes";
import { Switch } from "./Form";
import { SettlingItem } from "./SettlingRows";

/**
 * One setting: what it is called, what it does, and the control that sets it.
 *
 * Each setting gets its own row, so two controls never share a line because
 * the words happened to be short enough in one language. The control stands at
 * the end of the row while the row has room for it, and below the words once
 * it does not; the row decides from its own width, not the screen's, so the
 * same setting lays out the same way in any card.
 *
 * The description is wired to the control by `describedBy`, which the caller
 * hands to whichever element is the control.
 */
export function SettingRow({
    title,
    description,
    dimmed = false,
    role,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** For a setting that applies only while another one is on. */
    dimmed?: boolean;
    /** `listitem`, where the rows are a list of like things. */
    role?: "listitem";
    children?: ReactNode | ((describedBy: string | undefined) => ReactNode);
}) {
    return (
        <SettingLayout
            title={title}
            description={description}
            dimmed={dimmed}
            role={role}
            columns="grid-cols-1 @min-[34rem]:grid-cols-[minmax(0,1fr)_auto]"
            place="@min-[34rem]:justify-end"
        >
            {children}
        </SettingLayout>
    );
}

/**
 * A setting that is on or off and takes effect as it turns. The switch keeps
 * the end of the row at every width, where a thumb expects it, because it
 * never needs more room than the words leave it.
 */
export function SettingToggle({
    title,
    description,
    label,
    checked,
    onCheckedChange,
    disabled,
    dimmed = false,
    role,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** The switch's own name, where the title is more than words. */
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    /** For a setting that applies only while another one is on. */
    dimmed?: boolean;
    /** `listitem`, where the rows are a list of like things. */
    role?: "listitem";
}) {
    return (
        <SettingLayout
            title={title}
            description={description}
            dimmed={dimmed}
            role={role}
            columns="grid-cols-[minmax(0,1fr)_auto]"
            place="justify-end"
        >
            {(describedBy) => (
                <Switch
                    aria-label={label}
                    aria-describedby={describedBy}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                />
            )}
        </SettingLayout>
    );
}

/**
 * The row both share. A row draws the hairline above itself, except straight
 * under a card's head, which has drawn one already. Inside `SettlingRows` it
 * settles with its list: the rows after one that leaves close up, and one
 * that arrives wears the arrival mark.
 */
function SettingLayout({
    title,
    description,
    dimmed = false,
    role,
    columns,
    place,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    dimmed?: boolean;
    role?: "listitem";
    columns: string;
    place: string;
    children?: ReactNode | ((describedBy: string | undefined) => ReactNode);
}) {
    const id = useId();
    const describedBy = description === undefined ? undefined : id;
    return (
        <SettlingItem
            role={role}
            className="@container border-t border-border [header+&]:border-t-0"
        >
            <div
                className={classes(
                    "grid items-center gap-x-6 gap-y-2.5 px-gutter py-3 ",
                    columns,
                    dimmed && "opacity-55",
                )}
            >
                <div className="min-w-0">
                    <div className="text-sm font-medium break-words">
                        {title}
                    </div>
                    {description !== undefined && (
                        <div
                            id={id}
                            className="mt-0.5 max-w-[60ch] text-sm text-text-secondary"
                        >
                            {description}
                        </div>
                    )}
                </div>
                {children !== undefined && (
                    <div
                        className={classes(
                            "flex min-w-0 flex-wrap items-center gap-2",
                            place,
                        )}
                    >
                        {typeof children === "function"
                            ? children(describedBy)
                            : children}
                    </div>
                )}
            </div>
        </SettlingItem>
    );
}

/** A note under a card's settings: what holds for all of them. */
export function SettingNote({ children }: { children: ReactNode }) {
    return (
        <p className="border-t border-border px-gutter py-3 text-xs text-text-muted">
            {children}
        </p>
    );
}
