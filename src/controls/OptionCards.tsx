import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { type ReactNode, useId } from "react";

import { type Choice } from "../foundation/choice";
import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";

/** An answer and the line that says what it means. */
export interface CardOption<
    Value extends string = string,
> extends Choice<Value> {
    description: ReactNode;
}

/**
 * A question answered by picking one of a few, where each answer needs a line
 * saying what it means.
 *
 * A radio group rather than a row of buttons, because a button is an act that
 * happens and leaves and this is a value that is held: the chosen card is
 * marked at rest and stays marked, so an answer still waiting on something
 * else (a category, a name) is not an answer nobody can see.
 */
export function OptionCards<Value extends string>({
    label,
    options,
    value,
    suggested,
    suggestedMark,
    disabled = false,
    onValueChange,
    className,
}: {
    label: string;
    options: readonly CardOption<Value>[];
    /** Undefined while the question is unanswered. */
    value: Value | undefined;
    /**
     * The answer the app suggests, such as the one it recommends, which
     * wears a tint and a mark until the question is answered. Taking it is
     * the same press as taking any other.
     */
    suggested?: Value;
    /** What marks the suggestion as one, before its words. */
    suggestedMark?: ReactNode;
    disabled?: boolean;
    onValueChange: (value: Value) => void;
    className?: string;
}) {
    const id = useId();
    return (
        <RadioGroup
            aria-label={label}
            value={value ?? null}
            disabled={disabled}
            onValueChange={(next) => onValueChange(next as Value)}
            className={classes("grid gap-2 sm:grid-cols-2", className)}
        >
            {options.map((option, index) => (
                <Radio.Root
                    key={option.value}
                    value={option.value}
                    // Its own words and line, which inside a field win over
                    // the field's name that Base UI would give every card.
                    aria-labelledby={`${id}-${index}`}
                    aria-describedby={
                        isContent(option.description)
                            ? `${id}-${index}-description`
                            : undefined
                    }
                    disabled={option.disabled}
                    className={classes(
                        "cursor-pointer rounded-button border px-3 py-2 text-left",
                        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45",
                        "data-[checked]:border-accent data-[checked]:bg-accent-weak",
                        // A suggestion wears the ink's tint until the question
                        // is answered.
                        option.value === suggested
                            ? "data-[unchecked]:border-accent/40 data-[unchecked]:bg-accent-weak/60 data-[unchecked]:hover:border-accent"
                            : "data-[unchecked]:border-border-strong data-[unchecked]:bg-surface data-[unchecked]:hover:border-accent data-[unchecked]:hover:bg-accent-weak",
                    )}
                >
                    <span
                        id={`${id}-${index}`}
                        className={classes(
                            "flex items-center gap-1.5 text-sm font-medium",
                            option.value === value ? "text-accent" : "",
                        )}
                    >
                        {option.value === suggested && suggestedMark}
                        {option.label}
                    </span>
                    {isContent(option.description) && (
                        <span
                            id={`${id}-${index}-description`}
                            className="block text-xs text-text-secondary"
                        >
                            {option.description}
                        </span>
                    )}
                </Radio.Root>
            ))}
        </RadioGroup>
    );
}
