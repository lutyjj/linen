import { Combobox } from "@base-ui/react/combobox";
import { type ReactNode, useState } from "react";

import { type Choice } from "../foundation/choice";
import { classes } from "../foundation/classes";
import {
    OPTION_CLASS,
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
import { CONTROL_CLASS, Field } from "./Field";
import { PICKER_CLASS, PickerMark } from "./Select";

/** The search box at the top of a picker's list. */
const POPUP_SEARCH_CLASS = `${CONTROL_CLASS} mb-1 w-full outline-none`;

/**
 * One value out of a list nobody can scan, such as the world's time zones,
 * with the search box that makes it scannable. It only chooses: a picker that
 * also creates what was typed is the app's own.
 */
export function SearchSelect({
    label,
    hint,
    name,
    validate,
    placeholder,
    searchLabel,
    choices,
    value,
    onValueChange,
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
    placeholder: string;
    searchLabel: string;
    choices: readonly Choice[];
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    width?: number;
    /** The trigger's classes, as a select's. */
    className?: string;
    id?: string;
}) {
    const [open, setOpen] = useState(false);
    const chosen = choices.find((choice) => choice.value === value);

    return (
        <Field label={label} hint={hint} validate={validate} width={width}>
            <Combobox.Root
                items={choices}
                autoHighlight
                open={open}
                onOpenChange={setOpen}
                disabled={disabled}
                name={name}
                value={chosen ?? null}
                onValueChange={(next: Choice | null) => {
                    if (next === null) return;
                    onValueChange(next.value);
                    setOpen(false);
                }}
            >
                <Combobox.Trigger
                    id={id}
                    className={classes(
                        PICKER_CLASS,
                        "flex w-full",
                        chosen === undefined ? "text-text-secondary" : "",
                        className,
                    )}
                    onClick={() => setOpen(true)}
                >
                    <span className="truncate">
                        {chosen?.label ?? placeholder}
                    </span>
                    <PickerMark />
                </Combobox.Trigger>
                <Combobox.Portal>
                    <Combobox.Positioner
                        sideOffset={4}
                        align="start"
                        className={POSITIONER_CLASS}
                    >
                        <Combobox.Popup
                            render={renderLeaving}
                            aria-label={label}
                            className={classes(
                                POPUP_CLASS,
                                "w-[var(--anchor-width)] min-w-64",
                            )}
                        >
                            <Combobox.Arrow className="absolute" />
                            <Combobox.Input
                                // Named by its own words rather than by
                                // the field's, which name the trigger.
                                aria-labelledby={undefined}
                                aria-label={searchLabel}
                                placeholder={searchLabel}
                                className={POPUP_SEARCH_CLASS}
                            />
                            <Combobox.List className="max-h-56 overflow-y-auto">
                                {(choice: Choice) => (
                                    <Combobox.Item
                                        key={choice.value}
                                        value={choice}
                                        disabled={choice.disabled}
                                        className={OPTION_CLASS}
                                    >
                                        {choice.label}
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </Field>
    );
}
