import { AnimatePresence, m, useAnimate, useIsPresent } from "motion/react";
import { type ReactNode, type Ref, useLayoutEffect, useRef } from "react";

import { classes } from "../foundation/classes";
import { spring } from "./tokens";

/**
 * A region showing one of several views of the same thing, such as a chart
 * or its numbers, or the steps of what a person does, such as a form and
 * then what it made. Another view crosses the last where they stand: the
 * region travels from the height of the view it showed to the height of the
 * next, so the card around it and everything below move with it instead of
 * jumping, and the views cross-fade inside it.
 *
 * Between swaps the region is as tall as its view, so a row unfolding inside
 * one is that row's own motion and not the region's.
 */
export function Swap({
    view,
    stepped = false,
    className,
    children,
}: {
    /** Which view is shown. A change of it is a swap. */
    view: string;
    /**
     * The views are steps of what a person does, so each view that arrives
     * takes the focus and shows its start, even where the act that brought
     * it stood outside the region and went with the step, as a dialog's
     * submit does. Without it, a view takes the focus only from a view that
     * leaves holding it, and a control that stays, such as the one choosing
     * between a chart and its numbers, keeps it either way.
     */
    stepped?: boolean;
    /**
     * The region's place in the flow, such as a margin or a width. Its height
     * is the swap's, so it takes no padding or border of its own.
     */
    className?: string;
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
        // The focus goes on with the person: from a view that leaves holding
        // it, and in a stepped swap from what holds the region, where it
        // falls when the act that swapped went with the step, as a dialog's
        // submit does. Anywhere else, it is on something that stays.
        const active = document.activeElement;
        const arriving = content.current?.querySelector<HTMLElement>(
            ":scope > :not([inert])",
        );
        if (
            arriving &&
            (content.current?.contains(active) ||
                (stepped &&
                    (active === null || active.contains(region.current))))
        ) {
            arriving.focus({ preventScroll: true });
            showStart(arriving);
        }
        // A swap that interrupts another starts from where the region stands.
        const from =
            region.current.style.height === ""
                ? settled.current
                : region.current.offsetHeight;
        const to = content.current?.offsetHeight;
        if (from === undefined || to === undefined || from === to) return;
        const swap = ++swaps.current;
        // Held at once rather than from the animation's first frame, so
        // nothing around the region, such as a centred dialog, moves in
        // between and shifts the view leaving out of place.
        region.current.style.height = `${from}px`;
        void animate(region.current, { height: [from, to] }, spring("enter"))
            // A later swap owns the height from here.
            .then(() => {
                if (swap === swaps.current) region.current.style.height = "";
            });
    }, [view, stepped, animate, region]);

    return (
        <div
            ref={region}
            className={classes(
                "overflow-clip [overflow-clip-margin:3px]",
                className,
            )}
        >
            <div ref={content} className="relative">
                <AnimatePresence initial={false} mode="popLayout">
                    <SwapView key={view}>{children}</SwapView>
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * Brings the start of a view that arrives into sight where whatever it
 * scrolls in has left it above, as the end of a long form leaves a short
 * result. Focus alone would not: it centres a view taller than its room.
 */
function showStart(view: HTMLElement) {
    let top = 0;
    for (let box = view.parentElement; box; box = box.parentElement) {
        if (/auto|scroll|hidden/.test(getComputedStyle(box).overflowY)) {
            top = Math.max(top, box.getBoundingClientRect().top);
        }
    }
    if (view.getBoundingClientRect().top < top) {
        view.scrollIntoView({ block: "start" });
    }
}

/**
 * One view of a swap. The view being left is drawn over the next until it has
 * faded, taking no room, so it is inert from its first frame of leaving: a tap
 * reaches the view arriving, and only one view is read out. A view takes the
 * focus as a whole, so it can be focused but is no stop of Tab's, and wears
 * no ring: it is no control.
 */
function SwapView({
    children,
    ref,
}: {
    children: ReactNode;
    /** Motion's own, which it hands a child it pops out of the layout. */
    ref?: Ref<HTMLDivElement>;
}) {
    const present = useIsPresent();
    return (
        <m.div
            ref={ref}
            inert={!present}
            aria-hidden={!present || undefined}
            tabIndex={-1}
            className={present ? "outline-none" : "absolute inset-x-0 top-0"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: spring("leave") }}
        >
            {children}
        </m.div>
    );
}
