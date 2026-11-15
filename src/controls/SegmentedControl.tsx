import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId } from "react";

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
    onChange,
}: {
    label: string;
    /** Undefined where nothing is chosen yet, which no option answers to. */
    value: Value | undefined;
    options: readonly { value: Value; label: string }[];
    onChange: (value: Value) => void;
}) {
    const group = useId();
    return (
        <RadioGroup
            aria-label={label}
            value={value ?? null}
            onValueChange={(next) => {
                if (next !== value) onChange(next as Value);
            }}
            className="relative isolate inline-flex h-(--height-control) shrink-0 items-stretch rounded-button border border-border-strong bg-surface p-0.5"
        >
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <Radio.Root
                        key={option.value}
                        value={option.value}
                        data-label={option.label}
                        className={classes(
                            "relative flex cursor-pointer flex-col items-center justify-center rounded-input px-2 text-sm",
                            CHOSEN_WIDTH_CLASS,
                            chosenLayerClass(active),
                            active
                                ? "font-medium text-accent"
                                : "text-text-secondary hover:text-text",
                        )}
                    >
                        {active && <ChosenMark group={group} radius="input" />}
                        <span className="relative">{option.label}</span>
                    </Radio.Root>
                );
            })}
        </RadioGroup>
    );
}
