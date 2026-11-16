import { Field as BaseField } from "@base-ui/react/field";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { classes } from "../foundation/classes";

/**
 * The frame every field wears, wherever it stands: a form, a table cell, a
 * record's details. Something a hand can change looks changeable at rest, so
 * the frame is always drawn; it is a hairline that firms under the pointer
 * rather than a box that shouts. A popup takes focus off the trigger that
 * opened it, so the open state firms the frame too.
 */
export const CONTROL_CLASS =
    "h-(--height-control) rounded-button border border-border-strong bg-surface px-2.5 text-sm text-text placeholder:text-text-muted hover:border-text-muted data-[popup-open]:border-text-muted aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50";

/**
 * A control under its name, with the hint that explains it and, once its
 * value is refused, the error that says why. Base UI's field carries it: the
 * control inside is named by the label and described by the error and the
 * hint, and marked invalid while refused. That control is Base UI's, such as
 * `CellInput` or a picker; a native element goes through Base UI's `Input`,
 * as `<Input render={<textarea />} />` does. The name is no `label` element,
 * so a press on it focuses a picker rather than opening it.
 */
export function Field({
    label,
    hint,
    name,
    validate,
    compact = false,
    width,
    className = "",
    children,
}: {
    label: string;
    hint?: ReactNode;
    /** The key of its error in its form's `errors`. */
    name?: string;
    /**
     * The app's own check of the value, Base UI's: the error, or null where
     * the value is fine. It runs on submit, and as the value changes after.
     */
    validate?: BaseField.Root.Props["validate"];
    /** For a tight place, such as inside another popup. */
    compact?: boolean;
    /**
     * How much room the control needs, in the spacing scale's own steps. A
     * field that states its own width does not need a box drawn around it to
     * hold one, and a row of them lines up because they were asked to.
     */
    width?: number;
    className?: string;
    children: ReactNode;
}) {
    return (
        <BaseField.Root
            name={name}
            validate={validate}
            data-field
            // A stated width is what the field asks for, up to the width it is
            // given. Held against that width, it is not the least room the
            // field needs, so a grid that holds it can be as narrow as a phone.
            style={
                width === undefined
                    ? undefined
                    : { width: `min(calc(var(--spacing) * ${width}), 100%)` }
            }
            className={classes(
                "min-w-0 max-w-full",
                compact ? "" : "mb-4",
                className,
            )}
        >
            <BaseField.Label
                nativeLabel={false}
                render={<div />}
                className={classes(
                    "mb-1 block",
                    compact
                        ? "text-xs text-text-secondary"
                        : "text-sm font-medium",
                )}
            >
                {label}
            </BaseField.Label>
            {children}
            <BaseField.Error
                className="mt-1 flex items-start gap-1 text-xs text-danger"
                render={({ children: error, ...props }) => (
                    <div {...props}>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-px size-3.5 shrink-0"
                        />
                        <span className="min-w-0">{error}</span>
                    </div>
                )}
            />
            {hint !== undefined && (
                <BaseField.Validity>
                    {/* Base UI describes the control in the order its parts
                        appear; the hint comes again after a refusal, so the
                        control is described by its error first. */}
                    {({ validity }) => (
                        <BaseField.Description
                            key={String(validity.valid === false)}
                            className="mt-1 text-xs text-text-secondary"
                        >
                            {hint}
                        </BaseField.Description>
                    )}
                </BaseField.Validity>
            )}
        </BaseField.Root>
    );
}

/**
 * Fields and their action side by side on one baseline.
 *
 * The row owns the vertical rhythm its fields normally carry, so a labelled
 * field, a control, and the button that submits them share a bottom edge
 * instead of each solving alignment alone.
 */
export function FieldRow({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        // Its fields give way to the column it stands in rather than hold
        // the column open, so a row of fields fits a phone.
        <div
            className={classes(
                "flex min-w-0 flex-wrap items-end gap-3 [&_[data-field]]:mb-0",
                className,
            )}
        >
            {children}
        </div>
    );
}
