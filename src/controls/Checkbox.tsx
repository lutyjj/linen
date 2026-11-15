import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ReactNode } from "react";

import { classes } from "../foundation/classes";

// Shape and skin apart: a box that is marked replaces the resting colours
// rather than layering over them, which two same-property utilities in one
// class list settle by stylesheet order instead.
const CHECK_SHAPE =
    "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-check border align-[-2px]";
const CHECK_RESTING = "border-border-strong bg-surface";
const CHECK_MARKED = "border-accent bg-accent text-bg";

function CheckIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.5 6.5 5 9l4.5-5.5" />
        </svg>
    );
}

/**
 * A box that is ticked, and the words that say what ticking it does.
 *
 * The words are part of the control rather than a `label` pointing at it: the
 * element a library renders for the box is not the one a person presses, so a
 * label aimed at it names something invisible and clicking the words does
 * nothing. Given no children the box carries its name in `aria-label`, which is
 * the shape a table column takes, where the heading is the words.
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
    const box = (
        <span
            aria-hidden="true"
            className={classes(
                CHECK_SHAPE,
                CHECK_RESTING,
                "text-bg group-data-[checked]:border-accent group-data-[checked]:bg-accent",
            )}
        >
            <BaseCheckbox.Indicator>
                <CheckIcon />
            </BaseCheckbox.Indicator>
        </span>
    );
    return (
        <BaseCheckbox.Root
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={ariaLabel}
            className={classes(
                "group inline-flex cursor-pointer items-center gap-2 text-left text-sm data-[disabled]:cursor-default data-[disabled]:opacity-50",
                children === undefined ? "" : "w-full",
                secondary ? "text-text-secondary hover:text-text" : "",
                className,
            )}
        >
            {box}
            {children}
        </BaseCheckbox.Root>
    );
}

/**
 * The control that selects a row, or every row, wherever a list can be acted
 * on in bulk.
 *
 * A checkbox by role rather than by shape, so the count the selection bar
 * states is reachable by name, and one padded hit target so a thumb can find
 * it in a table row that is 36px tall.
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
    /** The state a press asks for, and whether it asked for a range, with
     * Shift held. */
    onCheckedChange: (checked: boolean, range: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked ? true : indeterminate ? "mixed" : false}
            aria-label={label}
            disabled={disabled}
            onClick={(event) => onCheckedChange(!checked, event.shiftKey)}
            className="-m-2 cursor-pointer p-2 disabled:cursor-default disabled:opacity-45"
        >
            <CheckGlyph checked={checked} indeterminate={indeterminate} />
        </button>
    );
}

/** The checkbox visual alone, for rows whose selection the row itself owns. */
export function CheckGlyph({
    checked,
    indeterminate = false,
}: {
    checked: boolean;
    indeterminate?: boolean;
}) {
    const marked = checked || indeterminate;
    return (
        <span
            aria-hidden="true"
            className={classes(
                CHECK_SHAPE,
                marked ? CHECK_MARKED : CHECK_RESTING,
            )}
        >
            {indeterminate ? (
                <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path d="M3 6h6" />
                </svg>
            ) : checked ? (
                <CheckIcon />
            ) : null}
        </span>
    );
}
