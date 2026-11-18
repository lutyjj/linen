import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId } from "react";

import { type Choice } from "../foundation/choice";
import { classes } from "../foundation/classes";
import {
    CHOSEN_WIDTH_CLASS,
    chosenLayerClass,
    ChosenMark,
} from "../motion/ChosenMark";

/**
 * One value out of a few, each a word or two: a theme, a scale, a hue. A
 * radio group underneath, so it is one stop on the Tab key and the arrow keys
 * move the choice, as assistive technology announces it.
 */
export function SegmentedControl<Value extends string>({
    label,
    value,
    options,
    onValueChange,
    disabled = false,
    className,
}: {
    label: string;
    /** Undefined where nothing is chosen yet, which no option answers to. */
    value: Value | undefined;
    options: readonly Choice<Value>[];
    onValueChange: (value: Value) => void;
    disabled?: boolean;
    className?: string;
}) {
    const group = useId();
    return (
        <RadioGroup
            aria-label={label}
            value={value ?? null}
            disabled={disabled}
            onValueChange={(next) => {
                if (next !== value) onValueChange(next as Value);
            }}
            className={classes(
                "relative isolate inline-flex h-(--height-control) shrink-0 items-stretch rounded-button border border-border-strong bg-surface p-0.5 inactive:dimmed",
                className,
            )}
        >
            {options.map((option, index) => {
                const active = option.value === value;
                return (
                    <Radio.Root
                        key={option.value}
                        value={option.value}
                        // Its own words, which inside a field win over the
                        // field's name that Base UI would give every option.
                        aria-labelledby={`${group}-${index}`}
                        disabled={option.disabled}
                        data-label={option.label}
                        className={classes(
                            "relative flex flex-col items-center justify-center rounded-input px-2 text-sm pressable:cursor-pointer",
                            // A disabled group dims as one.
                            option.disabled && !disabled && "dimmed",
                            CHOSEN_WIDTH_CLASS,
                            chosenLayerClass(active),
                            active
                                ? "font-medium text-accent"
                                : "text-text-secondary pressable:hover:text-text",
                        )}
                    >
                        {active && <ChosenMark group={group} radius="input" />}
                        <span id={`${group}-${index}`} className="relative">
                            {option.label}
                        </span>
                    </Radio.Root>
                );
            })}
        </RadioGroup>
    );
}
