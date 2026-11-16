import { useState } from "react";

/**
 * Whether the answer to an act is still to come. `wait` takes what the act
 * returned and hands it back: a promise holds `waiting` until it settles,
 * kept or failed, and anything else is an answer at once. `then` runs once
 * an answer has come, not when the act failed. A failure ends the wait and
 * goes no further; saying what failed is the act's own.
 */
export function useWaiting(): [
    waiting: boolean,
    wait: <T>(answer: T, then?: () => void) => T,
] {
    const [waiting, setWaiting] = useState(false);
    const wait = <T>(answer: T, then?: () => void): T => {
        if (!(answer instanceof Promise)) {
            then?.();
            return answer;
        }
        setWaiting(true);
        void answer.then(
            () => {
                setWaiting(false);
                then?.();
            },
            () => setWaiting(false),
        );
        return answer;
    };
    return [waiting, wait];
}
