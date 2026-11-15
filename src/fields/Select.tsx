import { Select as BaseSelect } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { type Choice, type ChoiceGroup } from "../foundation/choice";
import { classes } from "../foundation/classes";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
import { CONTROL_CLASS, Field } from "./Field";

/**
 * What says a control opens something: a list, or a record's details. One
 * mark for all of them, so a select, a search, an account, and a record read
 * as the same kind of thing. It turns while what it opens is open (`turning`
 * in motion.css), from the state Base UI puts on the control.
 */
export function PickerMark() {
    return (
        <span aria-hidden="true" className="turning flex shrink-0">
            <ChevronDown className="size-3.5 text-text-muted" />
        </span>
    );
}

/** A picker's trigger: its value at the start, its mark at the end. */
export const PICKER_CLASS = `${CONTROL_CLASS} group/picker inline-flex cursor-pointer items-center justify-between gap-1.5 text-left select-none`;

function isGroup(entry: Choice | ChoiceGroup): entry is ChoiceGroup {
    return "choices" in entry;
}

export function CellSelect({
    choices,
    placeholder,
    value,
    onValueChange,
    disabled,
    inline = false,
    className = "",
    id,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
}: {
    /**
     * Plain choices, and groups of them under a heading, listed in this
     * order.
     */
    choices: readonly (Choice | ChoiceGroup)[];
    /** Shown for the empty value, and choosing it clears the selection. */
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    /**
     * Render the popup in place instead of a portal. Required inside another
     * popup, whose dismissal treats a portalled click as an outside press.
     */
    inline?: boolean;
    className?: string;
    id?: string;
    "aria-label"?: string;
    "aria-describedby"?: string;
    /** Set while the value is refused, as a field's error does. */
    "aria-invalid"?: boolean;
}) {
    const entries: readonly (Choice | ChoiceGroup)[] =
        placeholder === undefined
            ? choices
            : [{ value: "", label: placeholder }, ...choices];
    const items = entries.flatMap((entry) =>
        isGroup(entry) ? entry.choices : [entry],
    );
    const chosen = items.find((item) => item.value === value);
    const unchosen = (list: readonly Choice[]) =>
        list.filter((item) => item !== chosen);

    const option = (item: Choice) => (
        <BaseSelect.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={classes(
                "cursor-pointer rounded-input px-2 py-1.5 data-[highlighted]:bg-accent-weak data-[highlighted]:text-accent data-[selected]:font-medium data-[disabled]:cursor-default data-[disabled]:opacity-50",
                item.value === "" ? "text-text-secondary" : "",
            )}
        >
            <BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
        </BaseSelect.Item>
    );

    const positioned = (
        <BaseSelect.Positioner
            sideOffset={4}
            align="start"
            alignItemWithTrigger={false}
            className={POSITIONER_CLASS}
        >
            <BaseSelect.Popup
                render={renderLeaving}
                className={classes(
                    POPUP_CLASS,
                    "flex max-h-72 min-w-[var(--anchor-width)] flex-col",
                )}
            >
                <BaseSelect.Arrow className="absolute" />
                {chosen !== undefined && (
                    <div className="mb-1 shrink-0 border-b border-border pb-1">
                        {option(chosen)}
                    </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {entries.map((entry) => {
                        if (!isGroup(entry)) {
                            return entry === chosen ? null : option(entry);
                        }
                        const rest = unchosen(entry.choices);
                        // A heading over nothing would only say the kind is
                        // empty, which the list already shows.
                        if (rest.length === 0) return null;
                        return (
                            <BaseSelect.Group
                                key={`group:${entry.label}`}
                                className="mt-1 border-t border-border pt-1 first:mt-0 first:border-t-0 first:pt-0"
                            >
                                <BaseSelect.GroupLabel className="px-2 pt-1 pb-0.5 text-xs text-text-muted">
                                    {entry.label}
                                </BaseSelect.GroupLabel>
                                {rest.map(option)}
                            </BaseSelect.Group>
                        );
                    })}
                </div>
            </BaseSelect.Popup>
        </BaseSelect.Positioner>
    );
    return (
        <BaseSelect.Root
            items={items}
            value={value}
            // Choosing what is already chosen is not a change. The popup lifts
            // the held value to the top of its own list, so it is the easiest
            // thing in there to press, and every press of it wrote and said so.
            onValueChange={(next: string | null) => {
                if ((next ?? "") !== value) onValueChange(next ?? "");
            }}
            disabled={disabled}
            modal={false}
        >
            <BaseSelect.Trigger
                id={id}
                aria-label={ariaLabel}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={classes(
                    PICKER_CLASS,
                    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                    value === "" ? "text-text-secondary" : "",
                    className,
                )}
            >
                <BaseSelect.Value className="truncate" />
                <PickerMark />
            </BaseSelect.Trigger>
            {inline ? (
                positioned
            ) : (
                <BaseSelect.Portal>{positioned}</BaseSelect.Portal>
            )}
        </BaseSelect.Root>
    );
}

/** A picker under its name, with its hint and, once refused, its error. */
export function Select({
    label,
    hint,
    error,
    width,
    className = "",
    ...rest
}: {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
    width?: number;
    className?: string;
} & Omit<
    Parameters<typeof CellSelect>[0],
    "id" | "className" | "aria-describedby" | "aria-invalid"
>) {
    return (
        <Field label={label} hint={hint} error={error} width={width}>
            {(control) => (
                <CellSelect
                    {...rest}
                    {...control}
                    className={classes("w-full", className)}
                />
            )}
        </Field>
    );
}
