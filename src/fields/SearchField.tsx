import { forwardRef, useEffect, useRef, useState } from "react";

import { classes } from "../foundation/classes";
import { CONTROL_CLASS } from "./Field";

/** How long typing pauses before what was typed is handed on. */
const SETTLE_MS = 250;

/**
 * A box that narrows a list, holding what is typed and handing it on once
 * typing pauses.
 *
 * The buffer is the point: a search that answers on every keystroke re-runs
 * whatever reads it a dozen times for one word, and where that answer changes
 * the page (a count, a chip, a row of results), it changes it under the
 * cursor. What is held is replaced whenever the value arrives from elsewhere,
 * so a cleared filter or a followed link still shows in the box.
 */
export const SearchField = forwardRef<
    HTMLInputElement,
    {
        /** The control's accessible name. Search boxes carry no visible label. */
        label: string;
        value: string;
        onChange: (value: string) => void;
        /**
         * Enter was pressed: what is typed is handed on at once, and then to
         * this as well, for a list that can do more with a finished search.
         */
        onSubmit?: (value: string) => void;
        placeholder?: string;
        className?: string;
    }
>(function SearchField(
    { label, value, onChange, onSubmit, placeholder, className = "" },
    ref,
) {
    const [typed, setTyped] = useState(value);
    const settle = useRef(onChange);
    settle.current = onChange;
    // What this box last handed on. The value comes back through the props a
    // render later, and taking that echo as news would put it back in the box
    // over whatever has been typed since.
    const handedOn = useRef(value);

    useEffect(() => {
        if (value === handedOn.current) return;
        handedOn.current = value;
        setTyped(value);
    }, [value]);

    useEffect(() => {
        if (typed === handedOn.current) return;
        const timer = setTimeout(() => {
            handedOn.current = typed;
            settle.current(typed);
        }, SETTLE_MS);
        return () => clearTimeout(timer);
    }, [typed]);

    return (
        <input
            ref={ref}
            aria-label={label}
            className={classes(
                CONTROL_CLASS,
                "placeholder:text-text-muted",
                className,
            )}
            placeholder={placeholder}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
                if (event.key !== "Enter" || onSubmit === undefined) return;
                if (typed !== handedOn.current) {
                    handedOn.current = typed;
                    settle.current(typed);
                }
                onSubmit(typed);
            }}
        />
    );
});
