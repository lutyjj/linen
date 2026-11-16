import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { type ReactNode, useId } from "react";

import { classes } from "../foundation/classes";
import { useWords } from "../foundation/words";
import { CONTROL_CLASS, Field } from "./Field";

const STEP_CLASS =
    "flex w-(--height-control) shrink-0 cursor-pointer items-center justify-center text-text-secondary hover:bg-sunken hover:text-text active:bg-border data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

/**
 * A number set within a range in steps, under its name: the value between a
 * step down and a step up, its unit inside the frame after it. The keyboard
 * steps it with the arrows, ten steps at a time with Shift or Page Up and
 * Page Down, and to either end with Home and End; typing sets it directly
 * and leaving the field brings it back inside the range. Base UI's number
 * field carries all of it.
 *
 * `onValueChange` follows every step and keystroke; `onValueCommit` hears
 * the value once it is settled, when the field is left or a step is taken,
 * for an app that writes what was set.
 */
export function NumberField({
    label,
    hint,
    name,
    validate,
    value,
    onValueChange,
    onValueCommit,
    min,
    max,
    step = 1,
    largeStep = step * 10,
    unit,
    format,
    disabled,
    width,
    className,
    id,
}: {
    label: string;
    hint?: ReactNode;
    /** The key of its error in its form's `errors`. */
    name?: string;
    validate?: Parameters<typeof Field>[0]["validate"];
    /** Null while the field is empty. */
    value: number | null;
    onValueChange: (value: number | null) => void;
    onValueCommit?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    /** A step with Shift held, or Page Up and Page Down. */
    largeStep?: number;
    /** What the number counts, such as `dB`, inside the frame after it. */
    unit?: ReactNode;
    /** How the number is written, as `Intl.NumberFormat` writes it. */
    format?: Intl.NumberFormatOptions;
    disabled?: boolean;
    width?: number;
    /** The frame's classes. */
    className?: string;
    id?: string;
}) {
    const words = useWords();
    const unitId = useId();
    return (
        <Field
            label={label}
            hint={hint}
            name={name}
            validate={validate}
            width={width}
        >
            <BaseNumberField.Root
                id={id}
                value={value}
                onValueChange={(next) => onValueChange(next)}
                onValueCommitted={(next) => onValueCommit?.(next)}
                min={min}
                max={max}
                step={step}
                largeStep={largeStep}
                format={format}
                disabled={disabled}
            >
                <BaseNumberField.Group
                    className={classes(
                        CONTROL_CLASS,
                        "flex w-full items-stretch overflow-hidden p-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent has-[[aria-invalid=true]]:border-danger has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                        className,
                    )}
                >
                    <BaseNumberField.Decrement
                        aria-label={words.decrease}
                        className={classes(
                            STEP_CLASS,
                            "border-r border-border",
                        )}
                    >
                        <Minus aria-hidden="true" className="size-3.5" />
                    </BaseNumberField.Decrement>
                    <BaseNumberField.Input
                        aria-describedby={
                            unit === undefined ? undefined : unitId
                        }
                        className="min-w-0 flex-1 bg-transparent px-2 text-right tabular-nums outline-none"
                    />
                    {unit !== undefined && (
                        <span
                            id={unitId}
                            className="flex shrink-0 items-center pr-2.5 text-text-muted"
                        >
                            {unit}
                        </span>
                    )}
                    <BaseNumberField.Increment
                        aria-label={words.increase}
                        className={classes(
                            STEP_CLASS,
                            "border-l border-border",
                        )}
                    >
                        <Plus aria-hidden="true" className="size-3.5" />
                    </BaseNumberField.Increment>
                </BaseNumberField.Group>
            </BaseNumberField.Root>
        </Field>
    );
}
