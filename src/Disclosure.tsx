import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";

import { classes } from "./classes";
import { renderLeaving } from "./motion";

/**
 * What a control shows and hides in place: a record's details, the filters a
 * phone folds away, a review band. Base UI's Collapsible owns whether it is
 * open and says so to assistive technology; `panel` (motion.css)
 * unfolds it from the control and folds it back, and the content mounts only
 * while it is open.
 */
export function DisclosurePanel({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <Collapsible.Panel
            render={renderLeaving}
            className={classes("panel", className)}
        >
            {children}
        </Collapsible.Panel>
    );
}
