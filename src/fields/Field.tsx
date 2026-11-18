import { Field as BaseField } from "@base-ui/react/field";
import { CircleAlert } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";

/**
 * How every field looks while it takes no input, keyed on a native control's
 * `disabled` and on the `data-disabled` Base UI marks a field's parts with.
 */
const DISABLED_CLASS =
    "disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

/**
 * The frame every field wears, wherever it stands: a form, a table cell, a
 * record's details. Something a hand can change looks changeable at rest, so
 * the frame is always drawn; it is a hairline that firms under the pointer
 * rather than a box that shouts. A popup takes focus off the trigger that
 * opened it, so the open state firms the frame too.
 *
 * Its height is a floor rather than a size. Chromium centres the line of an
 * input given a height a pixel below a picker's words; an input that meets
 * the floor lays its line where every field's words stand.
 */
export const CONTROL_CLASS = `min-h-(--height-control) rounded-button border border-border-strong bg-surface px-2.5 text-sm text-text placeholder:text-text-muted hover:border-text-muted data-[popup-open]:border-text-muted aria-[invalid=true]:border-danger ${DISABLED_CLASS}`;

/**
 * The same frame around an input and what stands beside it inside, such as
 * its unit or its steps. It answers the input's focus and refusal as a lone
 * control's frame does, and dims only with the field, whose disabling Base UI
 * marks on the frame: a step that cannot go further dims on its own.
 */
export const INPUT_FRAME_CLASS = `${CONTROL_CLASS} cursor-text p-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent has-[[aria-invalid=true]]:border-danger`;

/**
 * A value and its unit, as "120 seconds" reads in a sentence: the value at
 * the frame's inset, where every field's value starts, and the unit a space
 * after it, on its baseline. The input shares a cell with a hidden copy of
 * its words, which gives the cell their width; when the room runs short the
 * unit gives way first, cut to an ellipsis, and only then the value. The
 * label around them takes a press anywhere beside the words to the input.
 * Without a unit the value stands the same way.
 */
export function ValueAndUnit({
    input,
    text,
    unit,
    unitId,
}: {
    /** The input's own props, as a Base UI part hands them to `render`. */
    input: ComponentProps<"input">;
    /** What the input shows now: its value, or its placeholder. */
    text: string;
    unit: ReactNode;
    unitId: string;
}) {
    return (
        <label className="grid min-w-0 flex-1 grid-cols-[minmax(0,max-content)_minmax(0,1fr)] content-center items-baseline px-2.5">
            <input
                {...input}
                className={classes(
                    input.className,
                    "col-start-1 row-start-1 w-0 min-w-full disabled:cursor-not-allowed",
                )}
            />
            {/* The copy ends in a space: the caret's room, and the space
                between the value and its unit. */}
            <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 overflow-hidden whitespace-pre"
            >
                {text}{" "}
            </span>
            {isContent(unit) && (
                <span id={unitId} className="truncate text-text-muted">
                    {unit}
                </span>
            )}
        </label>
    );
}

/**
 * A control under its name, with the hint that explains it and, once its
 * value is refused, the error that says why. Base UI's field carries it: the
 * control inside is named by the label and described by the error and the
 * hint, and marked invalid while refused. That control is Base UI's, such as
 * `CellInput` or a picker; a native element goes through Base UI's `Input`,
 * as `<Input render={<textarea />} />` does. The name is no `label` element,
 * so a press on it focuses a picker rather than opening it.
 *
 * A field keeps no room around itself: what stacks fields sets the room
 * between them, so a field reads the same in a grid, a column and a row.
 */
export function Field({
    label,
    hint,
    name,
    validate,
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
    /**
     * How much room the control needs, in the spacing scale's own steps. A
     * field that states its own width does not need a box drawn around it to
     * hold one, and a row of them lines up because they were asked to. The
     * name and the messages are not held to it.
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
            className={classes("min-w-0 max-w-full", className)}
        >
            <BaseField.Label
                nativeLabel={false}
                render={<div />}
                className="mb-1 block text-sm font-medium"
            >
                {label}
            </BaseField.Label>
            {width === undefined ? (
                children
            ) : (
                // A stated width is the control's, up to the width the field
                // is given. Its name and its messages take the room the field
                // stands in, so a narrow control's error reads in a line.
                <div
                    data-width
                    className="w-(--width) max-w-full"
                    style={
                        {
                            "--width": `calc(var(--spacing) * ${width})`,
                        } as CSSProperties
                    }
                >
                    {children}
                </div>
            )}
            <BaseField.Error
                className="mt-1 flex max-w-prose items-start gap-1 text-xs text-danger"
                render={({ children: error, ...props }) => (
                    <div {...props} data-message>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-px size-3.5 shrink-0"
                        />
                        <span className="min-w-0">{error}</span>
                    </div>
                )}
            />
            {isContent(hint) && (
                <BaseField.Validity>
                    {/* Base UI describes the control in the order its parts
                        appear; the hint comes again after a refusal, so the
                        control is described by its error first. */}
                    {({ validity }) => (
                        <BaseField.Description
                            key={String(validity.valid === false)}
                            data-message
                            className="mt-1 max-w-prose text-xs text-text-secondary"
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
 * Fields and their action side by side, their controls on one line.
 *
 * While its fields hold a name and a control alone, everything in it stands
 * on the foot of the line. While any field says something under its control,
 * the row stands on the top instead, and what is not a field stands a name's
 * room down, its 20px line and 4px gap, so the controls keep one line and the
 * message hangs below it. A field widens to hold its message, which moves
 * what follows it along the row. A field may stand in an element of its own.
 *
 * In a column narrower than 28rem, a phone's, the row stands its fields one
 * under another, each filling the column whatever width it states, and its
 * actions under them, so a stacked form's edges agree. Fields stand 16px
 * apart across the row and down it, as stacked fields do. The row reads the
 * column through a container query, so it takes its width from where it
 * stands, never from its fields: as a flex item or in a box that fits its
 * contents it needs a width of its own.
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
                "@container/row flex min-w-0 flex-wrap items-end gap-4 has-data-message:items-start @max-md/row:*:data-field:basis-full @max-md/row:*:has-data-field:basis-full @max-md/row:**:data-width:w-full @md/row:has-data-message:*:not-data-field:not-has-data-field:mt-6",
                className,
            )}
        >
            {children}
        </div>
    );
}
