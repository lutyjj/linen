import { Input } from "@base-ui/react/input";
import {
    type InputHTMLAttributes,
    type ReactNode,
    useEffect,
    useState,
} from "react";

import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";
import { CONTROL_CLASS, Field } from "./Field";

/** A text box under its name, with its hint and, once refused, its error. */
export function TextField({
    label,
    hint,
    validate,
    width,
    className = "",
    ...rest
}: {
    label: string;
    hint?: ReactNode;
    validate?: Parameters<typeof Field>[0]["validate"];
    width?: number;
} & Parameters<typeof CellInput>[0]) {
    return (
        <Field label={label} hint={hint} validate={validate} width={width}>
            <CellInput {...rest} className={classes("w-full", className)} />
        </Field>
    );
}

/**
 * A bare control for use inside a table cell, where the column is the label,
 * and the control inside a `Field`, which names and describes it.
 *
 * A unit, when the value has one, is part of the field rather than words
 * floating beside it: it sits inside the frame, after the value, so "120" and
 * "seconds" read as one answer and move as one when the row wraps.
 */
export function CellInput({
    className = "",
    unit,
    ...rest
}: InputHTMLAttributes<HTMLInputElement> & { unit?: ReactNode }) {
    if (!isContent(unit)) {
        return (
            <Input className={classes(CONTROL_CLASS, className)} {...rest} />
        );
    }
    return (
        <span
            className={classes(
                CONTROL_CLASS,
                "inline-flex cursor-text items-center gap-1.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent has-[[aria-invalid=true]]:border-danger has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                className,
            )}
        >
            <Input
                className="h-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-text-muted"
                {...rest}
            />
            <span aria-hidden="true" className="shrink-0 text-text-muted">
                {unit}
            </span>
        </span>
    );
}

/**
 * Text corrected where it is read, written when the field is left.
 *
 * Enter writes and Escape puts the held value back, so a field in a long
 * column is edited without a button beside every row.
 */
export function CellText({
    label,
    value,
    draft,
    onCommit,
    onDiscard,
    clearable = false,
    placeholder,
    unit,
    className = "",
}: {
    label: string;
    value: string;
    /**
     * Text to start from instead of the held value, such as a suggestion
     * opened to change. The field takes the cursor, and leaving it writes.
     */
    draft?: string;
    /** Rejected by resolving to false, which puts the held value back. */
    onCommit: (value: string) => Promise<boolean>;
    /** The field was left without writing, so a draft it started from is spent. */
    onDiscard?: () => void;
    /** Whether emptying the box is an answer. */
    clearable?: boolean;
    placeholder?: string;
    unit?: ReactNode;
    className?: string;
}) {
    const [text, setText] = useState(draft ?? value);
    useEffect(() => setText(draft ?? value), [value, draft]);

    function commit() {
        const wanted = text.trim();
        if ((wanted === "" && !clearable) || wanted === value) {
            setText(value);
            onDiscard?.();
            return;
        }
        void onCommit(wanted).then((kept) => {
            if (!kept) setText(value);
        });
    }

    return (
        <CellInput
            aria-label={label}
            className={className}
            placeholder={placeholder}
            unit={unit}
            value={text}
            autoFocus={draft !== undefined}
            onChange={(event) => setText(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") setText(value);
            }}
        />
    );
}
