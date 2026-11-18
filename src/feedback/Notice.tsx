import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import { type Tone, TONE_TINT } from "../foundation/tone";
import { ToneIcon } from "./toneIcon";

/**
 * A message beside the act or the fields it is about, inside the card or
 * the form: a failure, a warning, a note or a success, in one sentence,
 * with what it means under it and the one thing to do about it at its end.
 * A failure is an alert, read out as it appears. The others are a status,
 * read out politely when their words change while they stand; one that only
 * appears may go unread where a browser does not read a new region, so what
 * a person must hear at once is a failure, or a toast.
 */
export function Notice({
    tone = "accent",
    title,
    description,
    action,
    className,
}: {
    tone?: Tone;
    /** What happened or holds, in one sentence. */
    title: ReactNode;
    description?: ReactNode;
    /** The one thing to do about it, such as a retry. */
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            role={tone === "danger" ? "alert" : "status"}
            className={classes(
                "rounded-button px-3 py-2.5 text-sm",
                TONE_TINT[tone],
                className,
            )}
        >
            <div className="flex flex-wrap items-start gap-x-2.5 gap-y-2">
                <ToneIcon tone={tone} className="mt-0.5" />
                <div className="min-w-0 flex-[1_1_16rem]">
                    <div className="font-medium break-words">{title}</div>
                    {description !== undefined && (
                        <div className="mt-0.5 text-text-secondary">
                            {description}
                        </div>
                    )}
                </div>
                {action !== undefined && (
                    <div className="ml-auto flex shrink-0 items-center gap-2 self-center">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}
