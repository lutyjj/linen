import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { spring, useStill } from "./tokens";

/**
 * Motion's features, loaded once the page has drawn, so an app's first
 * paint does not wait on them. Until they arrive, an element stands where
 * it starts, and anything it was asked to do then plays out.
 */
const features = () => import("./features").then((module) => module.default);

/** Layout, exits and state changes share a spring and respect stillness. */
export function MotionProvider({ children }: { children: ReactNode }) {
    const still = useStill();
    return (
        <LazyMotion features={features} strict>
            <MotionConfig
                reducedMotion={still ? "always" : "never"}
                transition={spring("enter")}
            >
                {children}
            </MotionConfig>
        </LazyMotion>
    );
}
