import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { useWaiting } from "../foundation/waiting";

/**
 * A form whose refused submit is heard. Once a submit has been answered, at
 * once or when the promise it returned settles, the first field marked
 * invalid takes the focus, so its name and its error are read out together
 * and the person starts where the fault is. A submit while the last answer is
 * still to come starts nothing.
 *
 * The app marks fields invalid by their `error`, set by the time the answer
 * has come.
 */
export function Form({
    onSubmit,
    className,
    children,
}: {
    /** The answers are given. An answer that comes later is its promise. */
    onSubmit: () => void | Promise<unknown>;
    className?: string;
    children: ReactNode;
}) {
    const form = useRef<HTMLFormElement>(null);
    const [waiting, wait] = useWaiting();
    // Each answer renders, so a refusal in the same words is heard again.
    const [answers, setAnswers] = useState(0);
    useLayoutEffect(() => {
        if (answers === 0) return;
        form.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus();
    }, [answers]);
    return (
        <form
            ref={form}
            noValidate
            className={className}
            onSubmit={(event) => {
                event.preventDefault();
                if (waiting) return;
                void wait(onSubmit(), () => setAnswers((count) => count + 1));
            }}
        >
            {children}
        </form>
    );
}
