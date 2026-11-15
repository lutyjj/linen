import { CircleAlert } from "lucide-react";
import { type ReactNode, useId } from "react";

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

/** What a field hands the one control its name labels, to spread on it. */
export interface FieldControl {
    id: string;
    /** The field's error and hint, which say more about the control. */
    "aria-describedby": string | undefined;
    /** Set while the field holds an error. */
    "aria-invalid": true | undefined;
}

/**
 * A control under its name, with the hint that explains it and, once its
 * value is refused, the error that says why.
 *
 * A child given as a function is one control, which the name labels: it is
 * handed the control's id, what describes it and whether it is invalid, to
 * spread on the control. A child given as itself is a group or a popup's own
 * control, and the name is a span: a `label` element forwards clicks inside
 * it to the control it names, which reopens a popup rendered in place rather
 * than choosing from it.
 */
export function Field({
    label,
    hint,
    error,
    compact = false,
    width,
    className = "",
    id: named,
    children,
}: {
    label: string;
    hint?: ReactNode;
    /** Why the value was refused, said under the control in its own words. */
    error?: ReactNode;
    /** For a tight place, such as inside another popup. */
    compact?: boolean;
    /**
     * A name of the caller's choosing, for a control something outside the
     * form has to reach, such as the question a submit puts the cursor back on.
     */
    id?: string;
    /**
     * How much room the control needs, in the spacing scale's own steps. A
     * field that states its own width does not need a box drawn around it to
     * hold one, and a row of them lines up because they were asked to.
     */
    width?: number;
    className?: string;
    children: ReactNode | ((control: FieldControl) => ReactNode);
}) {
    const generated = useId();
    const id = named ?? generated;
    const labels = typeof children === "function";
    const refused = error !== undefined && error !== null && error !== false;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy =
        [refused ? errorId : "", hint !== undefined ? hintId : ""]
            .filter((part) => part !== "")
            .join(" ") || undefined;
    const Name = labels ? "label" : "span";
    return (
        <div
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
            <Name
                {...(labels ? { htmlFor: id } : {})}
                className={classes(
                    "mb-1 block",
                    compact
                        ? "text-xs text-text-secondary"
                        : "text-sm font-medium",
                )}
            >
                {label}
            </Name>
            {labels
                ? children({
                      id,
                      "aria-describedby": describedBy,
                      "aria-invalid": refused || undefined,
                  })
                : children}
            {refused && (
                <p
                    id={errorId}
                    className="mt-1 flex items-start gap-1 text-xs text-danger"
                >
                    <CircleAlert
                        aria-hidden="true"
                        className="mt-px size-3.5 shrink-0"
                    />
                    <span className="min-w-0">{error}</span>
                </p>
            )}
            {hint !== undefined && (
                <p id={hintId} className="mt-1 text-xs text-text-secondary">
                    {hint}
                </p>
            )}
        </div>
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
