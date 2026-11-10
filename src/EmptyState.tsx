import type { ReactNode } from "react";

import { Actions } from "./Button";
import { Card } from "./Card";

export function EmptyState({
    title,
    detail,
    children,
}: {
    title: string;
    detail?: string;
    children?: ReactNode;
}) {
    return (
        <Card className="px-6 py-12 text-center">
            <h2 className="text-md font-semibold">{title}</h2>
            {detail !== undefined && (
                <p className="mx-auto mt-1 max-w-[65ch] text-sm text-text-secondary">
                    {detail}
                </p>
            )}
            {children !== undefined && (
                <Actions className="mt-4 justify-center">{children}</Actions>
            )}
        </Card>
    );
}
