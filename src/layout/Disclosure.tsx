import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";

import { classes } from "../foundation/classes";
import { renderLeaving } from "../foundation/popup";

/**
 * What a control shows and hides in place: a record's details, the filters a
 * phone folds away. Base UI's Collapsible owns whether it is open and says so
 * to assistive technology; `panel` (motion.css) unfolds it from the control
 * and folds it back, and the content mounts only while it is open.
 */
export function DisclosurePanel({
    className,
    children,
}: {
    /**
     * The panel's place in the flow, such as a margin, on a frame around the
     * box that clips, which keeps the focus ring's room (linen.css) and so
     * stands in something that keeps the room of padding too.
     */
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={classes("panel-frame", className)}>
            <Collapsible.Panel render={renderLeaving} className="panel">
                {children}
            </Collapsible.Panel>
        </div>
    );
}
