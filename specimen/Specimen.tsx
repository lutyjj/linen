import type { ReactNode } from "react";

import { Card, CardBody, classes } from "../src";

/**
 * One part of the language: what it is for, said once, then the real
 * components drawn in the states that part has.
 *
 * Samples are framed on a card. Components that are cards themselves, such
 * as a `Card` of rows, stand on the page as they do on a screen, so no card
 * is ever drawn inside another.
 */
export function Specimen({
    title,
    rule,
    framed = true,
    children,
}: {
    title: string;
    /** The rule this part follows, in one or two sentences. */
    rule?: ReactNode;
    framed?: boolean;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4">
            <header>
                <h2 className="text-md font-semibold">{title}</h2>
                {rule !== undefined && (
                    <p className="max-w-prose text-sm text-text-secondary">
                        {rule}
                    </p>
                )}
            </header>
            {framed ? (
                <Card>
                    <CardBody>{children}</CardBody>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">{children}</div>
            )}
        </section>
    );
}

/** A row of samples that wraps, each one named beneath. */
export function Samples({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={classes("flex flex-wrap items-start gap-4", className)}>
            {children}
        </div>
    );
}

/** One sample and the name of the state it shows. */
export function Sample({
    name,
    children,
}: {
    name: string;
    children: ReactNode;
}) {
    return (
        <figure className="flex flex-col items-start gap-1">
            <div className="flex min-h-(--height-control) items-center">
                {children}
            </div>
            <figcaption className="text-xs text-text-muted">{name}</figcaption>
        </figure>
    );
}

/** A label for a group of samples inside one specimen. */
export function Group({
    name,
    children,
}: {
    name: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{name}</h3>
            {children}
        </div>
    );
}

/** The column every section stacks its specimens in. */
export function Stack({ children }: { children: ReactNode }) {
    return <div className="flex flex-col gap-10">{children}</div>;
}
