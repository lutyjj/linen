import { type ReactNode, useState } from "react";

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
    error,
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
    /** Why the answer was refused, said under the box, which takes the focus. */
    error?: ReactNode;
    onOpenChange: (open: boolean) => void;
    /**
     * The answer, trimmed. One that takes a moment to act on is the promise
     * returned (`FormDialog`). The app closes the dialog once it is done.
     */
    onConfirm: (value: string) => void | Promise<unknown>;
}) {
    // Each opening starts from the default, set before the first frame; a
    // closing dialog keeps its words as it leaves.
    const [value, setValue] = useState(defaultValue);
    const [shown, setShown] = useState(open);
    if (open !== shown) {
        setShown(open);
        if (open) setValue(defaultValue);
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            confirmLabel={confirmLabel}
            disabled={value.trim() === ""}
            width="26rem"
            onConfirm={() => onConfirm(value.trim())}
        >
            <Field compact label={label} error={error}>
                {(control) => (
                    <CellInput
                        {...control}
                        autoFocus
                        value={value}
                        placeholder={placeholder}
                        onChange={(event) => setValue(event.target.value)}
                        className="w-full"
                    />
                )}
            </Field>
        </FormDialog>
    );
}
