import type { ComponentProps, ReactNode, Ref } from "react";

import { Actions } from "../controls/Button";
import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";

/**
 * One concern on the page. Its own edge stands above its first part and
 * below its last, so a part that draws a hairline there, a row above it or
 * a head below it, draws none, nor does the first row of a list
 * (`role="list"`) that is the card's first part.
 */
export function Card({
    className = "",
    children,
    ...props
}: ComponentProps<"section">) {
    return (
        <section
            {...props}
            className={classes(
                "overflow-hidden rounded-card border border-border bg-surface [&>:first-child]:border-t-0 [&>[role=list]:first-child>:first-child]:border-t-0 [&>:last-child]:border-b-0",
                className,
            )}
        >
            {children}
        </section>
    );
}

/**
 * A card's title, a count beside it, what the card is for, and its actions.
 *
 * The actions stand beside the title while the title and its count keep
 * their own width beside them, and go under the description once they would
 * not, so wide actions never squeeze the title. Under it they take the whole
 * line, so a control among them that grows, such as a search, fills it. The
 * description takes the head's width either way. The title's row is a
 * control tall in every head, so heads side by side or one under another
 * keep their titles, descriptions and hairlines in line, with actions or
 * without.
 */
export function CardHead({
    title,
    aside,
    description,
    className,
    children,
}: {
    title: ReactNode;
    /**
     * A count or timestamp about the card, which reads next to its name.
     *
     * Beside the title rather than among the actions, because it is the one
     * thing here whose width changes with what is on screen: among the
     * right-aligned actions it would shift every control it sits before, and a
     * count that moves the search box is what it counts.
     */
    aside?: ReactNode;
    description?: ReactNode;
    className?: string;
    /**
     * The card's actions, controls no taller than `--height-control`, since a
     * taller one would reach the description under it.
     */
    children?: ReactNode;
}) {
    return (
        <header
            className={classes(
                "@container border-b border-border bg-surface px-gutter py-2.5 md:py-3",
                className,
            )}
        >
            <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5 md:gap-y-2">
                {/* Beside the actions the words take the room left on the
                    line: the actions' share, one part in 10^9, is less than
                    a layout unit, so the last action ends at the head's
                    edge. On a line of their own the actions take all of it. */}
                <div className="min-w-0 grow-[1e9]">
                    {/* The title's first line is centred in a control's
                        height, the band the actions stand in. */}
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1 py-[calc((var(--height-control)-var(--text-md--line-height))/2)]">
                        <h2 className="text-md font-semibold">{title}</h2>
                        {aside}
                    </div>
                    {/* The description reaches under the actions and lends
                        the words none of its width, so the title alone
                        decides whether the actions fit beside it. */}
                    {isContent(description) && (
                        <p className="-me-[calc(100cqw-100%)] mt-1.5 max-w-[70ch] text-sm text-text-secondary [contain:inline-size] md:mt-2">
                            {description}
                        </p>
                    )}
                </div>
                {isContent(children) && (
                    <Actions className="min-h-(--height-control) min-w-0 grow">
                        {children}
                    </Actions>
                )}
            </div>
        </header>
    );
}

export function FormBand({
    ref,
    className,
    children,
}: {
    ref?: Ref<HTMLDivElement>;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            ref={ref}
            className={classes(
                "border-b border-border bg-sunken px-gutter py-3",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function Nothing({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <CardBody className={classes("text-sm text-text-secondary", className)}>
            {children}
        </CardBody>
    );
}

export function CardBody({
    className = "",
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={classes("px-gutter py-4", className)}>{children}</div>
    );
}

/**
 * Counts, timestamps, and other figures that sit beside a title.
 *
 * A count of zero says nothing the body's empty state does not, so it
 * renders as nothing rather than as a stray digit beside a button.
 */
export function Count({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    if (children === 0) return null;
    return (
        <span
            className={classes(
                "text-xs tabular-nums text-text-muted",
                className,
            )}
        >
            {children}
        </span>
    );
}
