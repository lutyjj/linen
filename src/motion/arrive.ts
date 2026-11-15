import { seconds, type Spring, spring } from "./tokens";

/** What `arrive()` hands a Motion element. */
export interface Arrival {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    transition: Spring & { delay: number };
}

/** A newly mounted surface settles once. */
export function arrive(depth = 0): Arrival {
    return {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { ...spring("enter"), delay: depth * seconds("stagger") },
    };
}
