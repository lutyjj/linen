import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import { COLUMN_CLASS } from "../foundation/column";
import { type Tone, TONE_TINT } from "../foundation/tone";
import { usePublishedHeight } from "../foundation/viewport";
import { ToneIcon } from "./toneIcon";

/**
 * A condition of the whole app, such as lost contact, an operation under
 * way, or a mode that does less than it should: one band across the screen,
 * in its tone, which stands on every screen until the app takes it away.
 */
export interface Condition {
    /** Which condition it is, kept while others come and go. */
    id: string;
    tone?: Tone;
    /** What holds, in one sentence, such as that contact is lost. */
    title: ReactNode;
    /** What it means or how long it has held (`Elapsed`). */
    description?: ReactNode;
    /** The one thing to do about it. */
    action?: ReactNode;
    /** Something is under way, as an operation in progress: the mark turns. */
    active?: boolean;
}

/** Which conditions stand first: the ones a person must act on soonest. */
const ORDER: Record<Tone, number> = {
    danger: 0,
    warn: 1,
    accent: 2,
    positive: 3,
};

/**
 * Where the app's conditions stand: at the top of the screen, stuck there
 * as it scrolls, with the screen's own bars stuck beneath them. While two
 * or more hold, they stand one under another, a failure first, then a
 * warning, then what is under way or simply so, and last what came good,
 * each with its own action, and the app's order within a tone. The place is
 * said politely: a condition that
 * arrives is read out once, and a count that ticks inside one is not.
 *
 * `Shell` holds one; a screen outside the shell puts one at its top.
 */
export function Conditions({
    conditions,
    className,
}: {
    /** Each while it holds, in any order. */
    conditions: readonly Condition[];
    className?: string;
}) {
    // Its height, for the bars stuck beneath it.
    const place = usePublishedHeight<HTMLDivElement>("--height-conditions");
    const standing = conditions.toSorted(
        (one, other) =>
            ORDER[one.tone ?? "accent"] - ORDER[other.tone ?? "accent"],
    );
    return (
        <div
            ref={place}
            role="status"
            className={classes("sticky top-(--inset-top) z-6", className)}
        >
            {standing.map(
                ({
                    id,
                    tone = "accent",
                    title,
                    description,
                    action,
                    active,
                }) => (
                    <div
                        key={id}
                        className={classes(
                            "border-b border-border",
                            TONE_TINT[tone],
                        )}
                    >
                        <div
                            className={classes(
                                COLUMN_CLASS,
                                "flex flex-wrap items-center gap-x-2.5 gap-y-1.5 py-2 text-sm",
                            )}
                        >
                            <ToneIcon tone={tone} active={active} />
                            <div className="flex min-w-0 flex-[1_1_14rem] flex-wrap items-baseline gap-x-2">
                                <span className="font-medium break-words">
                                    {title}
                                </span>
                                {description !== undefined && (
                                    <span className="text-text-secondary">
                                        {description}
                                    </span>
                                )}
                            </div>
                            {action !== undefined && (
                                <div className="ml-auto flex shrink-0 items-center gap-2">
                                    {action}
                                </div>
                            )}
                        </div>
                    </div>
                ),
            )}
        </div>
    );
}
