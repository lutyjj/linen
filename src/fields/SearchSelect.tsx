import { Combobox } from "@base-ui/react/combobox";
import { type ReactNode, useState } from "react";

import { classes } from "../foundation/classes";
import {
    OPTION_CLASS,
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
import { CONTROL_CLASS, Field } from "./Field";
import { type Choice, PICKER_CLASS, PickerMark } from "./Select";

/** The search box at the top of a picker's list. */
export const POPUP_SEARCH_CLASS = `${CONTROL_CLASS} mb-1 w-full outline-none`;

/**
 * One value out of a list nobody can scan, such as the world's currencies,
 * with the search box that makes it scannable. It only chooses: a picker that
 * also creates what was typed is the app's own.
 */
export function SearchSelect({
    label,
    hint,
    placeholder,
    searchLabel,
    choices,
    value,
    onValueChange,
    id,
}: {
    label: string;
    hint?: ReactNode;
    placeholder: string;
    searchLabel: string;
    choices: readonly Choice[];
    value: string;
    onValueChange: (value: string) => void;
    id?: string;
}) {
    const [open, setOpen] = useState(false);
    const chosen = choices.find((choice) => choice.value === value);

    return (
        <Field label={label} hint={hint} id={id}>
            {(named) => (
                <Combobox.Root
                    items={choices}
                    autoHighlight
                    open={open}
                    onOpenChange={setOpen}
                    value={chosen ?? null}
                    onValueChange={(next: Choice | null) => {
                        if (next === null) return;
                        onValueChange(next.value);
                        setOpen(false);
                    }}
                >
                    <Combobox.Trigger
                        id={named}
                        className={classes(
                            PICKER_CLASS,
                            "flex w-full",
                            chosen === undefined ? "text-text-secondary" : "",
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
                                    aria-label={searchLabel}
                                    placeholder={searchLabel}
                                    className={POPUP_SEARCH_CLASS}
                                />
                                <Combobox.List className="max-h-56 overflow-y-auto">
                                    {(choice: Choice) => (
                                        <Combobox.Item
                                            key={choice.value}
                                            value={choice}
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
            )}
        </Field>
    );
}
