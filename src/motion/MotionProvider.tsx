import { domMax, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { spring, useStill } from "./tokens";

/** Layout, exits and state changes share a spring and respect stillness. */
export function MotionProvider({ children }: { children: ReactNode }) {
    const still = useStill();
    return (
        <LazyMotion features={domMax} strict>
            <MotionConfig
                reducedMotion={still ? "always" : "never"}
                transition={spring("enter")}
            >
                {children}
            </MotionConfig>
        </LazyMotion>
    );
}
