import { Form as BaseForm } from "@base-ui/react/form";
import { type ReactNode, useMemo, useState } from "react";

import { useWaiting } from "../foundation/waiting";

/** Why each field's value was refused, by the field's `name`. */
export type FormErrors = Record<string, string | string[]>;

/**
 * A form whose refused submit is heard. Base UI's form carries it: a submit
 * checks every field first, and a field it refuses takes the focus instead of
 * reaching `onSubmit`. Once an answer has come, the first field its `errors`
 * name takes the focus, and each error stands under its field until the value
 * is edited. A submit while the last answer is still to come starts nothing.
 *
 * The app holds `errors` in state and sets them from every answer: what was
 * refused, or nothing once nothing was. It does not clear them as a submit
 * starts, which would spend the focus before the answer comes. An error says
 * what is wrong with its field's value, and a submit is refused at once until
 * that value is edited; a refusal for any other reason, and a failure, is a
 * `Notice`, and the next submit asks again.
 */
export function Form({
    errors,
    onSubmit,
    className,
    children,
}: {
    errors?: FormErrors;
    /** The answers are given. An answer that comes later is its promise. */
    onSubmit: () => void | Promise<unknown>;
    className?: string;
    children: ReactNode;
}) {
    const [waiting, wait] = useWaiting();
    const [answers, setAnswers] = useState(0);
    // Base UI shows errors again only when they are a new object, so each
    // answer hands it one, and a refusal in the same words is heard again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const given = useMemo(() => errors && { ...errors }, [errors, answers]);
    return (
        <BaseForm
            errors={given}
            className={className}
            onSubmit={(event) => {
                event.preventDefault();
                if (waiting) return;
                void wait(onSubmit(), () => setAnswers((count) => count + 1));
            }}
        >
            {children}
        </BaseForm>
    );
}
