import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { type ReactNode, useId, useRef } from "react";

import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";

/** The box, marked in the ink while ticked or mixed. */
const BOX_CLASS =
    "inline-flex size-4 shrink-0 items-center justify-center rounded-check border border-border-strong bg-surface align-[-2px] text-bg data-[checked]:border-accent data-[checked]:bg-accent data-[indeterminate]:border-accent data-[indeterminate]:bg-accent";

/** A box that stands alone answers the hand and dims itself. */
const ALONE_CLASS = "pressable:cursor-pointer inactive:dimmed";

/** A tick, or a dash while the box is mixed. */
function Mark({ indeterminate = false }: { indeterminate?: boolean }) {
    return (
        <BaseCheckbox.Indicator>
            <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d={indeterminate ? "M3 6h6" : "M2.5 6.5 5 9l4.5-5.5"} />
            </svg>
        </BaseCheckbox.Indicator>
    );
}

/**
 * A box that is ticked, and the words that say what ticking it does.
 *
 * The words are the box's label, which holds it, so a press on them ticks the
 * box, as Base UI's checkbox is labelled. Given no children the box carries
 * its name in `aria-label`, which is the shape a table column takes, where the
 * heading is the words.
 */
export function Checkbox({
    checked,
    onCheckedChange,
    disabled,
    secondary = false,
    className = "",
    "aria-label": ariaLabel,
    children,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    /** Secondary ink for the words, where the box is an aside to a form. */
    secondary?: boolean;
    className?: string;
    "aria-label"?: string;
    children?: ReactNode;
}) {
    const words = useId();
    const alone = !isContent(children);
    const box = (
        <BaseCheckbox.Root
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={ariaLabel}
            // Named by its words, which inside a field win over the field's
            // name that Base UI would give every box.
            aria-labelledby={alone ? undefined : words}
            className={classes(
                BOX_CLASS,
                // Held in its words, the box answers and dims with them.
                alone && classes(ALONE_CLASS, className),
            )}
        >
            <Mark />
        </BaseCheckbox.Root>
    );
    if (alone) return box;
    return (
        <label
            id={words}
            className={classes(
                "inline-flex w-full items-center gap-2 text-left text-sm not-has-data-[disabled]:cursor-pointer has-data-[disabled]:dimmed",
                secondary &&
                    "text-text-secondary not-has-data-[disabled]:hover:text-text",
                className,
            )}
        >
            {box}
            {children}
        </label>
    );
}

/**
 * The control that selects a row, or every row, wherever a list can be acted
 * on in bulk: a checkbox, mixed while some rows are chosen, named by what it
 * selects so the count a selection bar states is reachable by name. Its hit
 * target reaches past the box, so a thumb finds it in a row 36px tall.
 */
export function SelectToggle({
    label,
    checked,
    indeterminate = false,
    disabled = false,
    onCheckedChange,
}: {
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    /**
     * The state a press asks for, and whether it asked for a range, with
     * Shift held.
     */
    onCheckedChange: (checked: boolean, range: boolean) => void;
}) {
    const shifted = useRef(false);
    return (
        <BaseCheckbox.Root
            aria-label={label}
            checked={checked}
            indeterminate={indeterminate}
            disabled={disabled}
            // The press itself says whether Shift was held: the change it
            // makes reaches Preact as an event that does not.
            onClick={(event) => (shifted.current = event.shiftKey)}
            onCheckedChange={(next) => onCheckedChange(next, shifted.current)}
            className={classes(
                BOX_CLASS,
                ALONE_CLASS,
                "relative after:absolute after:-inset-2",
            )}
        >
            <Mark indeterminate={indeterminate} />
        </BaseCheckbox.Root>
    );
}
