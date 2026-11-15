/**
 * The inks that speak: the accent for what is simply so, and the three
 * states LANGUAGE.md holds in reserve. Each has its tint, the ground of a
 * message in that tone.
 */
export type Tone = "accent" | "positive" | "warn" | "danger";

export const TONE_INK: Record<Tone, string> = {
    accent: "text-accent",
    positive: "text-positive",
    warn: "text-warn",
    danger: "text-danger",
};

export const TONE_TINT: Record<Tone, string> = {
    accent: "bg-accent-weak",
    positive: "bg-positive-weak",
    warn: "bg-warn-weak",
    danger: "bg-danger-weak",
};
