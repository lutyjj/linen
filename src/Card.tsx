import { type HTMLMotionProps, m } from "motion/react";
import type { ReactNode, Ref } from "react";

import { Actions } from "./Button";
import { classes } from "./classes";

export function Card({
    className = "",
    children,
    ...props
}: HTMLMotionProps<"section">) {
    return (
        <m.section
            {...props}
            className={classes(
                "overflow-hidden rounded-card border border-border bg-surface",
                className,
            )}
        >
            {children}
        </m.section>
    );
}

export function CardHead({
    title,
    aside,
    description,
    children,
}: {
    title: string;
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
    children?: ReactNode;
}) {
    return (
        <header className="@container border-b border-border bg-surface px-gutter py-2.5 md:py-3">
            <div className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 md:gap-y-2 @min-[36rem]:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h2 className="text-md font-semibold">{title}</h2>
                    {aside}
                </div>
                {description !== undefined && (
                    <p className="max-w-[70ch] text-sm text-text-secondary @min-[36rem]:col-span-2 @min-[36rem]:row-start-2">
                        {description}
                    </p>
                )}
                {children !== undefined && (
                    <Actions className="min-w-0 @min-[36rem]:col-start-2 @min-[36rem]:row-start-1 @min-[36rem]:justify-end">
                        {children}
                    </Actions>
                )}
            </div>
        </header>
    );
}

export function FormBand({
    ref,
    children,
}: {
    ref?: Ref<HTMLDivElement>;
    children: ReactNode;
}) {
    return (
        <div
            ref={ref}
            className="border-b border-border bg-sunken px-gutter py-3"
        >
            {children}
        </div>
    );
}

export function Nothing({ children }: { children: ReactNode }) {
    return (
        <CardBody className="text-sm text-text-secondary">{children}</CardBody>
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
export function Count({ children }: { children: ReactNode }) {
    if (children === 0) return null;
    return (
        <span className="text-xs tabular-nums text-text-muted">{children}</span>
    );
}
