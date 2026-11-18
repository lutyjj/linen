import type { ReactNode } from "react";

import { Actions } from "../controls/Button";
import { classes } from "../foundation/classes";
import { isContent } from "../foundation/slot";
import { Card } from "./Card";

export function EmptyState({
    title,
    description,
    className,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    className?: string;
    /** The way to start. */
    children?: ReactNode;
}) {
    return (
        <Card className={classes("px-gutter py-12 text-center", className)}>
            <h2 className="text-md font-semibold">{title}</h2>
            {isContent(description) && (
                <p className="mx-auto max-w-prose text-sm text-text-secondary">
                    {description}
                </p>
            )}
            {isContent(children) && (
                <Actions className="mt-4 justify-center">{children}</Actions>
            )}
        </Card>
    );
}
