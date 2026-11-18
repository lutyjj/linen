import type { ComponentProps, ReactNode, Ref } from "react";

import { Actions } from "../controls/Button";
import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";

/**
 * A part of a card after its head: a row, a body, a form band, a note, or a
 * row an app builds for a list in a card. It draws the hairline above itself
 * and holds its contents a gutter from each of its edges. `band` names it to
 * the card it stands in.
 */
export const BAND_CLASS = "band border-t border-border p-gutter";

/**
 * The words' share of a line they hold with controls that wrap by fit, as a
 * head's title does with its actions and a setting's words with its control:
 * 10^9 times the controls' own. Beside the words, the controls' part of the
 * room left is less than a layout unit, so the last one ends on the line's
 * edge; on a line of their own, they take all of it.
 */
export const WORDS_SHARE_CLASS = "grow-[1e9]";

/**
 * One concern on the page: its head, then its bands, a hairline between one
 * and the next. Its own edge stands above its first part and below its last,
 * and the head draws the hairline under itself, so nothing at the edge or
 * straight under the head draws one: neither a part there nor a band first
 * in what stands there, such as a list of rows.
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
                "overflow-hidden rounded-card border border-border bg-surface [&>:is(:first-child,header+*)]:border-t-0 [&>:is(:first-child,header+*)>.band:first-child]:border-t-0 [&>:last-child]:border-b-0",
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
                "@container border-b border-border bg-surface p-gutter",
                className,
            )}
        >
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className={`min-w-0 ${WORDS_SHARE_CLASS}`}>
                    {/* The title's first line is centred in a control's
                        height, the band the actions stand in. */}
                    <div className="flex min-w-0 flex-wrap items-baseline gap-2 py-[calc((var(--height-control)-var(--text-md--line-height))/2)]">
                        <h2 className="text-md font-semibold">{title}</h2>
                        {aside}
                    </div>
                    {/* The description reaches under the actions and lends
                        the words none of its width, so the title alone
                        decides whether the actions fit beside it. */}
                    {isContent(description) && (
                        <p className="-me-[calc(100cqw-100%)] max-w-prose text-sm text-text-secondary [contain:inline-size]">
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

/**
 * A form opened inside a card, on the sunken ground. Each child is one
 * block of a column 16px apart: words go in a paragraph, controls in
 * `Actions`, and a block centred in it takes its width itself.
 */
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
                BAND_CLASS,
                "flex flex-col gap-4 bg-sunken",
                className,
            )}
        >
            {children}
        </div>
    );
}

/**
 * What a card says where what it holds has nothing in it, such as a list
 * with no rows yet: a sentence in a band of its own, which may hold a link.
 * A screen with nothing on it yet is an `EmptyState`.
 */
export function Nothing({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <p
            className={classes(
                BAND_CLASS,
                "text-sm text-text-secondary",
                className,
            )}
        >
            {children}
        </p>
    );
}

/**
 * What a card holds that is not a row. Each child is one block of a column
 * 16px apart: words go in a paragraph, controls in `Actions`, and a block
 * centred in it takes its width itself.
 */
export function CardBody({
    className = "",
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={classes(BAND_CLASS, "flex flex-col gap-4", className)}>
            {children}
        </div>
    );
}

/**
 * Counts, timestamps, and other figures that sit beside a title.
 *
 * A count of zero says nothing the body's empty state does not, so it
 * renders as nothing rather than as a stray digit beside a button, as does
 * a count handed nothing (`isContent`).
 */
export function Count({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    if (children === 0 || !isContent(children)) return null;
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
