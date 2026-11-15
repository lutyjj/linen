import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import { type Tone, TONE_INK } from "../foundation/tone";

/**
 * What a status can say: one of the speaking tones, `neutral` for a state
 * that is simply off or idle, and `unknown` for one that cannot be told,
 * such as before the first answer.
 */
export type StatusTone = Tone | "neutral" | "unknown";

const DOT: Record<StatusTone, string> = {
    accent: "bg-current",
    positive: "bg-current",
    warn: "bg-current",
    danger: "bg-current",
    neutral: "bg-current",
    unknown: "border border-current",
};

const WORDS: Record<StatusTone, string> = {
    accent: "text-text-secondary",
    positive: "text-text-secondary",
    warn: "font-medium text-warn",
    danger: "font-medium text-danger",
    neutral: "text-text-secondary",
    unknown: "text-text-muted",
};

const DOT_INK: Record<StatusTone, string> = {
    ...TONE_INK,
    neutral: "text-text-muted",
    unknown: "text-text-muted",
};

/**
 * The state something is in, in a word or two after a dot: where a top bar
 * says what its screen is doing, a card's head what its concern is, a row
 * what its thing is. The dot carries the tone; words that want attention,
 * a warning or a failure, wear its ink too. `active` says the state is
 * happening now, as a live feed or a run under way: the dot wears a ring
 * that beats while motion is welcome.
 */
export function Status({
    tone = "neutral",
    active = false,
    className,
    children,
}: {
    tone?: StatusTone;
    active?: boolean;
    className?: string;
    /** The state, in a word or two. */
    children: ReactNode;
}) {
    return (
        <span
            className={classes(
                "inline-flex min-w-0 items-center gap-1.5",
                WORDS[tone],
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={classes(
                    "size-2 shrink-0 rounded-full",
                    DOT_INK[tone],
                    DOT[tone],
                    active && "live-mark",
                )}
            />
            <span className="truncate">{children}</span>
        </span>
    );
}
