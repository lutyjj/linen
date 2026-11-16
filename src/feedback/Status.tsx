import { Popover } from "@base-ui/react/popover";
import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
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

interface StatusProps {
    tone?: StatusTone;
    active?: boolean;
    className?: string;
    /** The state, in a word or two. */
    children: ReactNode;
}

/** A status's look, and its dot and words, plain or explained. */
function statusParts({
    tone = "neutral",
    active = false,
    className,
    children,
}: StatusProps) {
    return {
        look: classes(
            "inline-flex min-w-0 items-center gap-1.5",
            WORDS[tone],
            className,
        ),
        state: (
            <>
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
            </>
        ),
    };
}

/**
 * The state something is in, in a word or two after a dot: where a top bar
 * says what its screen is doing, a card's head what its concern is, a row
 * what its thing is. The dot carries the tone; words that want attention,
 * a warning or a failure, wear its ink too. `active` says the state is
 * happening now, as a live feed or a run under way: the dot wears a ring
 * that beats while motion is welcome.
 */
export function Status(props: StatusProps) {
    const { look, state } = statusParts(props);
    return <span className={look}>{state}</span>;
}

/**
 * A `Status` for a state the person cannot change, which says why, such as
 * what access that only reads allows. Its words, underlined in dots, open
 * the `description` in a popup: under a resting pointer, or at a press or a
 * key, which takes the focus to it so it is read out. It is its own part so
 * an app that only reports states carries no popup.
 */
export function ExplainedStatus({
    description,
    ...status
}: StatusProps & {
    /** Why the state holds, in a sentence or two. */
    description: ReactNode;
}) {
    const { look, state } = statusParts(status);
    return (
        <Popover.Root>
            <Popover.Trigger
                openOnHover
                render={<button type="button" />}
                className={classes(
                    look,
                    "cursor-help rounded-input underline decoration-dotted underline-offset-2",
                )}
            >
                {state}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className={POSITIONER_CLASS}
                >
                    <Popover.Popup
                        render={renderLeaving}
                        className={classes(POPUP_CLASS, "w-64 px-3 py-2")}
                    >
                        <Popover.Arrow className="absolute" />
                        <Popover.Title className="sr-only">
                            {status.children}
                        </Popover.Title>
                        <Popover.Description className="text-text-secondary">
                            {description}
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}
