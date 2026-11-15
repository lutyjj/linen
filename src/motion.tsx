import {
    domMax,
    LazyMotion,
    MotionConfig,
    type MotionProps,
    type Transition,
} from "motion/react";
import {
    type HTMLAttributes,
    type ReactNode,
    useState,
    useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";

/** Shared timing and accessibility policy for interaction animations. */
const DURATION = {
    leave: 0.12,
    state: 0.18,
    enter: 0.28,
    mark: 1.2,
    stagger: 0.08,
    thinking: 1.5,
    land: 1,
} as const;
export type MotionToken = keyof typeof DURATION;

/**
 * The curves of motions that are not the spring. A fall is let go and
 * decelerates into its place from its first frame; a breath has no arrival
 * to settle into, so it crosses evenly; a fade leaves quickly and trails off.
 */
export const EASE = {
    fall: [0.2, 0, 0, 1],
    breath: [0.42, 0, 0.58, 1],
    fade: "easeOut",
} as const;

const STILL = "(prefers-reduced-motion: reduce)";

/** A token's length in seconds, the unit Motion reads. */
export function seconds(token: MotionToken): number {
    if (window.matchMedia(STILL).matches) return 0;
    return DURATION[token];
}

/**
 * A spring released from rest, settling without overshoot.
 */
export function spring(token: MotionToken): Transition {
    const duration = seconds(token);
    return duration === 0
        ? { duration: 0 }
        : { type: "spring", visualDuration: duration, bounce: 0 };
}

function subscribe(listener: () => void): () => void {
    const media = window.matchMedia(STILL);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
}

/** Live preference, including changes while the page is open. */
export function useStill(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(STILL).matches,
    );
}

function subscribeVisibility(listener: () => void): () => void {
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
}

/** Nonessential loops rest in hidden tabs and for readers asking for stillness. */
export function useLoop(): boolean {
    const still = useStill();
    const visible = useSyncExternalStore(
        subscribeVisibility,
        () => document.visibilityState !== "hidden",
    );
    return !still && visible;
}

/**
 * A pending refresh turns only while visible, a whole turn per `land`. When
 * the refresh ends, the turn under way finishes, so the mark comes to rest
 * upright rather than snapping back (motion.css).
 */
export function RefreshMotion({
    active,
    children,
}: {
    active: boolean;
    children: ReactNode;
}) {
    const loops = useLoop();
    const [turning, setTurning] = useState(false);
    if (active && loops && !turning) setTurning(true);
    if (!loops && turning) setTurning(false);
    return (
        <span
            className={turning ? "refresh-turning inline-flex" : "inline-flex"}
            onAnimationIteration={(event) => {
                // Only its own turn: what it holds may move by its own.
                if (
                    !active &&
                    event.target === event.currentTarget &&
                    event.animationName === "linen-turn"
                ) {
                    setTurning(false);
                }
            }}
        >
            {children}
        </span>
    );
}

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

/**
 * Renders a Base UI part that leaves with an exit, a popup, a dialog or a
 * panel, inert while it does: it is still seen going, but it takes no
 * pointer and no keys and is no longer read out, so the control a hand
 * reaches for next answers, and a list on its way out is not a second list.
 * `aria-hidden` says the same to readers of the accessibility tree that do
 * not account for `inert`.
 */
export function renderLeaving(
    props: HTMLAttributes<HTMLDivElement>,
    state: { transitionStatus?: string },
) {
    const leaving = state.transitionStatus === "ending";
    return (
        <div
            {...props}
            inert={leaving}
            aria-hidden={leaving || props["aria-hidden"]}
        />
    );
}

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

/**
 * Make a change the whole page wears, such as its theme or its language, as
 * one cross-fade rather than one frame. The change is applied at once and
 * the fade follows it. This is the platform's View Transitions API: the
 * whole page is one snapshot, and motion.css fades it over `enter`.
 */
export function crossFade(change: () => void): void {
    if (
        typeof document.startViewTransition !== "function" ||
        window.matchMedia(STILL).matches
    ) {
        change();
        return;
    }
    const root = document.documentElement;
    root.classList.add("cross-fade");
    const fade = document.startViewTransition(() => flushSync(change));
    latestFade = fade;
    // A change made mid-fade skips this one; the newer fade keeps the class.
    void fade.finished.finally(() => {
        if (latestFade === fade) root.classList.remove("cross-fade");
    });
}

let latestFade: ViewTransition | undefined;
