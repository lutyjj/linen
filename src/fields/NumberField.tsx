import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { type ReactNode, useId } from "react";

import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";
import { useWords } from "../foundation/words";
import { Field, INPUT_FRAME_CLASS, ValueAndUnit } from "./Field";

/**
 * A step takes a press across the frame's whole height, and the step up to
 * the frame's end, while its fill, pressed in place 2px inside the frame as
 * a segmented control's option is, is its mark's: the mark with 8px either
 * side, 30px wide, so the step up's mark centres 18px in from the frame's
 * end, where a select's chevron does. A step at an end of the range dims on
 * its own; in a disabled field the frame dims everything once.
 */
const STEP_CLASS =
    "flex py-0.5 text-text-secondary last:pr-0.5 pressable:cursor-pointer pressable:hover:text-text pressable:hover:*:bg-text/6 pressable:active:*:bg-text/12 not-in-data-disabled:disabled:dimmed";

/**
 * A number set within a range in steps: its value where every field's value
 * starts, its unit a space after it, and the step down and the step up
 * together at the frame's end, where a picker's mark stands. The keyboard
 * steps it with the arrows, a large step at a time with Shift held, and to
 * either end with Home and End; typing sets it directly and leaving the field
 * brings it back inside the range. Base UI's number field carries all of it.
 *
 * This is the bare control, named by `aria-label`, for a setting's row or a
 * table cell; `NumberField` stands it under its name.
 *
 * `onValueChange` follows every step and keystroke; `onValueCommitted` hears
 * the value once it is settled, when the field is left or a step is taken,
 * for an app that writes what was set.
 */
export function CellNumber({
    value,
    onValueChange,
    onValueCommitted,
    min,
    max,
    step = 1,
    largeStep = step * 10,
    unit,
    format,
    disabled,
    name,
    className,
    id,
    "aria-label": ariaLabel,
}: {
    /** Null while the field is empty. */
    value: number | null;
    onValueChange: (value: number | null) => void;
    onValueCommitted?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    /** A step with Shift held: ten of its steps unless it says otherwise. */
    largeStep?: number;
    /** What the number counts, such as `dB`, a space after it. */
    unit?: ReactNode;
    /** How the number is written, as `Intl.NumberFormat` writes it. */
    format?: Intl.NumberFormatOptions;
    disabled?: boolean;
    /** The key of its error in its form's `errors`. */
    name?: string;
    /** The frame's classes. */
    className?: string;
    id?: string;
    "aria-label"?: string;
}) {
    const words = useWords();
    const unitId = useId();
    return (
        <BaseNumberField.Root
            id={id}
            name={name}
            value={value}
            onValueChange={(next) => onValueChange(next)}
            onValueCommitted={(next) => onValueCommitted?.(next)}
            min={min}
            max={max}
            step={step}
            largeStep={largeStep}
            format={format}
            disabled={disabled}
        >
            <BaseNumberField.Group
                className={classes(
                    INPUT_FRAME_CLASS,
                    "flex w-full tabular-nums",
                    className,
                )}
            >
                <BaseNumberField.Input
                    aria-label={ariaLabel}
                    aria-describedby={isContent(unit) ? unitId : undefined}
                    className="bg-transparent outline-none"
                    render={(props, state) => (
                        <ValueAndUnit
                            input={props}
                            text={state.inputValue}
                            unit={unit}
                            unitId={unitId}
                        />
                    )}
                />
                <span className="flex shrink-0">
                    <BaseNumberField.Decrement
                        aria-label={words.decrease}
                        className={STEP_CLASS}
                    >
                        <span className="flex items-center rounded-input px-2">
                            <Minus aria-hidden="true" className="size-3.5" />
                        </span>
                    </BaseNumberField.Decrement>
                    <BaseNumberField.Increment
                        aria-label={words.increase}
                        className={STEP_CLASS}
                    >
                        <span className="flex items-center rounded-input px-2">
                            <Plus aria-hidden="true" className="size-3.5" />
                        </span>
                    </BaseNumberField.Increment>
                </span>
            </BaseNumberField.Group>
        </BaseNumberField.Root>
    );
}

/** A number in a range under its name, with its hint and, once refused, its error. */
export function NumberField({
    label,
    hint,
    validate,
    width,
    ...rest
}: {
    label: string;
    hint?: ReactNode;
    validate?: Parameters<typeof Field>[0]["validate"];
    width?: number;
} & Omit<Parameters<typeof CellNumber>[0], "aria-label">) {
    return (
        <Field label={label} hint={hint} validate={validate} width={width}>
            <CellNumber {...rest} />
        </Field>
    );
}
