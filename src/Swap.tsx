import { AnimatePresence, m, useAnimate, useIsPresent } from "motion/react";
import { forwardRef, type ReactNode, useLayoutEffect, useRef } from "react";

import { spring } from "./motion";

/**
 * A region showing one of several views of the same thing, such as a chart
 * or its numbers. Choosing another view crosses them where they stand: the
 * region travels from the height of the view it showed to the height of the
 * next, so the card around it and everything below move with it instead of
 * jumping, and the views cross-fade inside it.
 *
 * Between swaps the region is as tall as its view, so a row unfolding inside
 * one is that row's own motion and not the region's.
 */
export function Swap({
    view,
    children,
}: {
    /** Which view is shown. A change of it is a swap. */
    view: string;
    children: ReactNode;
}) {
    const [region, animate] = useAnimate<HTMLDivElement>();
    const content = useRef<HTMLDivElement>(null);
    // The height the shown view last settled at. A ResizeObserver reports
    // after layout, so when the view changes this still holds the old one.
    const settled = useRef<number>(undefined);
    const shown = useRef(view);
    const swaps = useRef(0);

    useLayoutEffect(() => {
        const element = content.current;
        if (element === null) return;
        const observer = new ResizeObserver(() => {
            settled.current = element.offsetHeight;
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (shown.current === view) return;
        shown.current = view;
        // A swap that interrupts another starts from where the region stands.
        const from =
            region.current.style.height === ""
                ? settled.current
                : region.current.offsetHeight;
        const to = content.current?.offsetHeight;
        if (from === undefined || to === undefined || from === to) return;
        const swap = ++swaps.current;
        void animate(region.current, { height: [from, to] }, spring("enter"))
            // A later swap owns the height from here.
            .then(() => {
                if (swap === swaps.current) region.current.style.height = "";
            });
    }, [view, animate, region]);

    return (
        <div ref={region} className="overflow-clip [overflow-clip-margin:3px]">
            <div ref={content} className="relative">
                <AnimatePresence initial={false} mode="popLayout">
                    <SwapView key={view}>{children}</SwapView>
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * One view of a swap. The view being left is drawn over the next until it has
 * faded, so it is inert from its first frame of leaving: a tap reaches the
 * view arriving, and only one view is read out.
 */
const SwapView = forwardRef<HTMLDivElement, { children: ReactNode }>(
    function SwapView({ children }, ref) {
        const present = useIsPresent();
        return (
            <m.div
                ref={ref}
                inert={!present}
                aria-hidden={!present || undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: spring("leave") }}
            >
                {children}
            </m.div>
        );
    },
);
