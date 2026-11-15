import type { MotionProps } from "motion/react";

import { seconds, spring } from "./tokens";

/** A newly mounted surface settles once. */
export function arrive(depth = 0): MotionProps {
    return {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { ...spring("enter"), delay: depth * seconds("stagger") },
    };
}

/** A chart reveals its extent without changing the surrounding layout. */
export function series(depth = 0): MotionProps {
    return {
        initial: { clipPath: "inset(0 100% 0 0)" },
        animate: { clipPath: "inset(0 0% 0 0)" },
        transition: { ...spring("enter"), delay: depth * seconds("stagger") },
    };
}
