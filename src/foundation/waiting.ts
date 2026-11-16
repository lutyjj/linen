import { useState } from "react";

/**
 * Whether the answer to an act is still to come. `wait` takes what the act
 * returned and hands it back: a promise holds `waiting` until it settles,
 * kept or failed, and anything else is an answer at once. `then` runs once
 * the answer has come. A failure ends the wait and goes no further; saying
 * what failed is the act's own.
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
        const done = () => {
            setWaiting(false);
            then?.();
        };
        void answer.then(done, done);
        return answer;
    };
    return [waiting, wait];
}
