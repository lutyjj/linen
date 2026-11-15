import { type ReactNode, useState } from "react";

import { useLoop } from "./tokens";

/**
 * A pending refresh turns only while visible, a whole turn per `land`. When
 * the refresh ends, the turn under way finishes, so the mark comes to rest
 * upright rather than snapping back (motion.css).
 */
export function RefreshMotion({
    active,
    children,
}: {
    active: boolean;
    children: ReactNode;
}) {
    const loops = useLoop();
    const [turning, setTurning] = useState(false);
    if (active && loops && !turning) setTurning(true);
    if (!loops && turning) setTurning(false);
    return (
        <span
            className={turning ? "refresh-turning inline-flex" : "inline-flex"}
            onAnimationIteration={(event) => {
                // Only its own turn: what it holds may move by its own.
                if (
                    !active &&
                    event.target === event.currentTarget &&
                    event.animationName === "linen-turn"
                ) {
                    setTurning(false);
                }
            }}
        >
            {children}
        </span>
    );
}
