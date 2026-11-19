import { CSPProvider } from "@base-ui/react/csp-provider";
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
 *
 * Base UI draws no `<style>` of its own beneath it; linen.css holds the one
 * rule it would have drawn, and linen uses none of the parts that draw a
 * `<script>`, so a page served under a Content Security Policy that forbids
 * inline styles and scripts needs no nonce for linen.
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
        <CSPProvider disableStyleElements>
            <WordsContext value={words}>
                <NavigationContext value={moves}>
                    <MotionProvider>{children}</MotionProvider>
                </NavigationContext>
            </WordsContext>
        </CSPProvider>
    );
}
