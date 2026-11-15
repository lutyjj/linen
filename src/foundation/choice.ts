/** One answer a control offers: what it holds, and what it says. */
export interface Choice<Value extends string = string> {
    value: Value;
    label: string;
    /** Offered, but not to be taken now. */
    disabled?: boolean;
}

/**
 * Choices under a heading, where a list holds things of more than one kind,
 * such as teams and people.
 */
export interface ChoiceGroup<Value extends string = string> {
    label: string;
    choices: readonly Choice<Value>[];
}
