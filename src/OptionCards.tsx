import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";

import { classes } from "./classes";

export interface CardOption<Value extends string> {
    value: Value;
    label: string;
    detail: string;
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
    proposed,
    proposedMark,
    disabled = false,
    onChoose,
}: {
    label: string;
    options: readonly CardOption<Value>[];
    /** Undefined while the question is unanswered. */
    value: Value | undefined;
    /**
     * The answer a model proposed, which carries the mark. Pressing it is
     * accepting it: the proposal is the same press the manual answer is.
     */
    proposed?: Value;
    /** What marks the proposal as one, before its words. */
    proposedMark?: ReactNode;
    disabled?: boolean;
    onChoose: (value: Value) => void;
}) {
    return (
        <RadioGroup
            aria-label={label}
            value={value ?? null}
            disabled={disabled}
            onValueChange={(next) => onChoose(next as Value)}
            className="grid gap-2 sm:grid-cols-2"
        >
            {options.map((option) => (
                <Radio.Root
                    key={option.value}
                    value={option.value}
                    className={classes(
                        "cursor-pointer rounded-button border px-3 py-2 text-left",
                        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45",
                        "data-[checked]:border-accent data-[checked]:bg-accent-weak",
                        // A proposal wears the ink's tint until it is answered,
                        // as a proposal in a field does.
                        option.value === proposed
                            ? "data-[unchecked]:border-accent/40 data-[unchecked]:bg-accent-weak/60 data-[unchecked]:hover:border-accent"
                            : "data-[unchecked]:border-border-strong data-[unchecked]:bg-surface data-[unchecked]:hover:border-accent data-[unchecked]:hover:bg-accent-weak",
                    )}
                >
                    <span
                        className={classes(
                            "flex items-center gap-1.5 text-sm font-medium",
                            option.value === value ? "text-accent" : "",
                        )}
                    >
                        {option.value === proposed && proposedMark}
                        {option.label}
                    </span>
                    <span className="block text-xs text-text-secondary">
                        {option.detail}
                    </span>
                </Radio.Root>
            ))}
        </RadioGroup>
    );
}
