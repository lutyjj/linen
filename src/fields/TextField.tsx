import { Input } from "@base-ui/react/input";
import {
    type ComponentProps,
    type ReactNode,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";
import {
    CONTROL_CLASS,
    Field,
    INPUT_FRAME_CLASS,
    ValueAndUnit,
    WIDTH_CLASS,
    widthStyle,
} from "./Field";

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
 * floating beside it: it follows the value inside the frame, so "120" and
 * "seconds" read as one answer and move as one when the row wraps. A unit
 * needs a value the app holds, which it follows wherever it ends: a value
 * only the input holds can change unheard, as a form's reset changes it. Its
 * `className` is the frame's, as every field's is; the value starts at the
 * frame's inset whatever the frame is given.
 */
export function CellInput({
    className = "",
    unit,
    width,
    ...rest
}: Omit<ComponentProps<"input">, "width"> & {
    /**
     * How wide its frame is, in the spacing scale's own steps, up to the
     * width it is given. At the end of a setting's row it fills the line
     * once the row puts it under the words.
     */
    width?: number;
} & (
        | { unit?: false | null | "" }
        | { unit: ReactNode; value: string | number }
    )) {
    const unitId = useId();
    const stated = width === undefined ? undefined : "";
    const frame = classes(stated !== undefined && WIDTH_CLASS, className);
    if (!isContent(unit)) {
        return (
            <Input
                {...rest}
                data-width={stated}
                style={{ ...widthStyle(width), ...rest.style }}
                className={classes(CONTROL_CLASS, frame)}
            />
        );
    }
    return (
        <Input
            aria-describedby={unitId}
            {...rest}
            className="bg-transparent outline-none placeholder:text-text-muted"
            render={(props, state) => (
                // The frame says what Base UI says of the input, as a number
                // field's frame does.
                <span
                    data-disabled={state.disabled || undefined}
                    data-width={stated}
                    style={widthStyle(width)}
                    className={classes(INPUT_FRAME_CLASS, "inline-flex", frame)}
                >
                    <ValueAndUnit
                        input={props}
                        text={
                            String(rest.value ?? "") ||
                            String(rest.placeholder ?? "")
                        }
                        unit={unit}
                        unitId={unitId}
                    />
                </span>
            )}
        />
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
    /**
     * Refused by resolving to false, or by failing, which puts the held value
     * back; a failure is the app's to report.
     */
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
    // A held value or a draft the app hands anew replaces what is typed.
    const [given, setGiven] = useState({ value, draft });
    if (given.value !== value || given.draft !== draft) {
        setGiven({ value, draft });
        setText(draft ?? value);
    }
    // A box handed a draft takes the cursor. `autoFocus` would only under
    // React: Preact writes the attribute, which a browser reads as a page
    // loads.
    const box = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (draft !== undefined) box.current?.focus();
    }, [draft]);

    function commit() {
        const wanted = text.trim();
        if ((wanted === "" && !clearable) || wanted === value) {
            setText(value);
            onDiscard?.();
            return;
        }
        void onCommit(wanted).then(
            (kept) => {
                if (!kept) setText(value);
            },
            () => setText(value),
        );
    }

    return (
        <CellInput
            aria-label={label}
            className={className}
            placeholder={placeholder}
            unit={unit}
            ref={box}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") setText(value);
            }}
        />
    );
}
