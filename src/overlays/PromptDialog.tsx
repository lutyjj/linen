import { type ReactNode, useEffect, useState } from "react";

import { Field } from "../fields/Field";
import { CellInput } from "../fields/TextField";
import { FormDialog } from "./Dialog";

/**
 * One question, asked where the answer is needed: a name, given once, for
 * something that has no field of its own on the screen asking. A question
 * with a home is asked there instead.
 */
export function PromptDialog({
    open,
    title,
    label,
    placeholder,
    confirmLabel,
    defaultValue = "",
    onOpenChange,
    onConfirm,
}: {
    open: boolean;
    title: ReactNode;
    label: string;
    placeholder: string;
    confirmLabel: string;
    /** What the box holds when it opens, such as a suggested name. */
    defaultValue?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: (value: string) => void;
}) {
    const [value, setValue] = useState("");
    useEffect(() => {
        if (open) setValue(defaultValue);
    }, [open, defaultValue]);

    return (
        <FormDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) setValue("");
                onOpenChange(next);
            }}
            title={title}
            confirmLabel={confirmLabel}
            disabled={value.trim() === ""}
            width="26rem"
            onConfirm={() => {
                onConfirm(value.trim());
                setValue("");
                onOpenChange(false);
            }}
        >
            <Field compact label={label}>
                <CellInput
                    autoFocus
                    aria-label={label}
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => setValue(event.target.value)}
                    className="w-full"
                />
            </Field>
        </FormDialog>
    );
}
