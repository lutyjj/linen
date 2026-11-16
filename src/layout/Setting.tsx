import { Field } from "@base-ui/react/field";
import type { ReactNode } from "react";

import { Switch } from "../controls/Switch";
import { classes } from "../foundation/classes";
import { SettlingItem } from "../motion/SettlingRows";

/**
 * One setting: what it is called, what it does, and the control that sets it.
 *
 * Each setting gets its own row, so two controls never share a line because
 * the words happened to be short enough in one language. The control stands at
 * the end of the row while the row has room for it beside the words, and below
 * them once it does not, where a control as wide as its line fills it; the row
 * decides from its own width and the control's, not the screen's, so the same
 * setting lays out the same way in any card, and a wide control never
 * squeezes the words.
 *
 * The description describes the control, any of Base UI's, through its field.
 */
export function SettingRow({
    title,
    description,
    dimmed = false,
    role,
    className,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** For a setting that applies only while another one is on. */
    dimmed?: boolean;
    /** `listitem`, where the rows are a list of like things. */
    role?: "listitem";
    className?: string;
    children?: ReactNode;
}) {
    return (
        <SettingLayout
            title={title}
            description={description}
            dimmed={dimmed}
            role={role}
            className={className}
            frame="flex flex-wrap"
            words="grow-[999] basis-64"
            place="grow"
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
    busy,
    dimmed = false,
    role,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** The switch's own name, where the title is more than words. */
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    /** The change is being written (`Switch`). */
    busy?: boolean;
    /** For a setting that applies only while another one is on. */
    dimmed?: boolean;
    /** `listitem`, where the rows are a list of like things. */
    role?: "listitem";
    className?: string;
}) {
    return (
        <SettingLayout
            title={title}
            description={description}
            dimmed={dimmed}
            role={role}
            className={className}
            frame="grid grid-cols-[minmax(0,1fr)_auto]"
            words=""
            place="justify-end"
        >
            <Switch
                aria-label={label}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                busy={busy}
            />
        </SettingLayout>
    );
}

/**
 * The row both share. A row draws the hairline above itself, except straight
 * under a card's head, alone or first of a list there, which has drawn one
 * already, and first in its card, whose edge stands there. Inside
 * `SettlingRows` it settles with its list: the rows after one that leaves
 * close up, and one that arrives wears the arrival mark.
 */
function SettingLayout({
    title,
    description,
    dimmed = false,
    role,
    frame,
    words,
    place,
    className,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    dimmed?: boolean;
    role?: "listitem";
    className: string | undefined;
    /** How the words and the control share the row. */
    frame: string;
    /** The words' share of it. */
    words: string;
    /** Where the control stands in its own share. */
    place: string;
    children?: ReactNode;
}) {
    return (
        <SettlingItem
            role={role}
            className={classes(
                "border-t border-border [header+&]:border-t-0 [header+*>&:first-child]:border-t-0",
                className,
            )}
        >
            <Field.Root
                className={classes(
                    "items-center gap-x-6 gap-y-2.5 px-gutter py-3",
                    frame,
                    dimmed && "opacity-55",
                )}
            >
                <div className={classes("min-w-0", words)}>
                    <div className="text-sm font-medium break-words">
                        {title}
                    </div>
                    {description !== undefined && (
                        <Field.Description
                            render={<div />}
                            className="mt-0.5 max-w-[60ch] text-sm text-text-secondary"
                        >
                            {description}
                        </Field.Description>
                    )}
                </div>
                {children !== undefined && (
                    <div
                        className={classes(
                            "flex min-w-0 flex-wrap items-center gap-2",
                            place,
                        )}
                    >
                        {children}
                    </div>
                )}
            </Field.Root>
        </SettlingItem>
    );
}

/** A note under a card's settings: what holds for all of them. */
export function SettingNote({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <p
            className={classes(
                "border-t border-border px-gutter py-3 text-xs text-text-muted [header+&]:border-t-0",
                className,
            )}
        >
            {children}
        </p>
    );
}
