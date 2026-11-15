import { type ReactNode, useMemo } from "react";

import { ENGLISH, type Words, WordsContext } from "./foundation/words";
import { MotionProvider } from "./motion/MotionProvider";
import {
    type Navigation,
    NavigationContext,
    navigationOf,
} from "./navigation/navigation";

/**
 * Everything the components share above them: their words, how the app moves
 * between its pages, and one clock for every animation.
 */
export function LinenProvider({
    words = ENGLISH,
    navigation,
    children,
}: {
    words?: Words;
    /** The app's router, which linen's links follow; plain anchors without. */
    navigation?: Navigation;
    children: ReactNode;
}) {
    const moves = useMemo(() => navigationOf(navigation), [navigation]);
    return (
        <WordsContext value={words}>
            <NavigationContext value={moves}>
                <MotionProvider>{children}</MotionProvider>
            </NavigationContext>
        </WordsContext>
    );
}
