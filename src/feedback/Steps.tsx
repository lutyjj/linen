import { Check } from "lucide-react";

import { classes } from "../foundation/classes";
import { useWords } from "../foundation/words";

/** One step of a task. */
export interface Step {
    id: string;
    label: string;
}

/**
 * Where a task of known steps stands: each step done, the one under way,
 * and the ones to come, in order. A task may open at any step, as one
 * resumed later does; the steps before it read as done. It fills the width
 * of where it stands, and narrower than 24rem, as on a phone, the steps not
 * under way keep their names for assistive technology only, so the row
 * fits.
 *
 * It holds no moves of its own: the task's Back, Cancel and Next are its
 * buttons, under a dialog's body or a screen's.
 */
export function Steps({
    label,
    steps,
    current,
    className,
}: {
    /** The task's name for its steps, such as `Setup`. */
    label: string;
    steps: readonly Step[];
    /** The id of the step under way. */
    current: string;
    className?: string;
}) {
    const words = useWords();
    const at = steps.findIndex((step) => step.id === current);
    return (
        <div className={classes("@container w-full min-w-0", className)}>
            <ol
                aria-label={label}
                className="flex min-w-0 items-center gap-2 text-sm"
            >
                {steps.map((step, index) => {
                    const done = index < at;
                    const now = index === at;
                    return (
                        <li
                            key={step.id}
                            aria-current={now ? "step" : undefined}
                            className={classes(
                                "flex min-w-0 items-center gap-2",
                                now && "shrink-0",
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={classes(
                                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-2xs font-medium tabular-nums",
                                    done && "border-accent bg-accent text-bg",
                                    now && "border-accent text-accent",
                                    !done &&
                                        !now &&
                                        "border-border-strong text-text-muted",
                                )}
                            >
                                {done ? (
                                    <Check className="size-3" />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={classes(
                                    "truncate",
                                    now
                                        ? "font-medium text-text"
                                        : "text-text-secondary @max-sm:sr-only",
                                )}
                            >
                                {step.label}
                                {done && (
                                    <span className="sr-only">
                                        , {words.done}
                                    </span>
                                )}
                            </span>
                            {index < steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="h-px w-4 shrink-0 bg-border-strong @sm:w-6"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
