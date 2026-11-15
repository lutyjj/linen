import {
    Children,
    type ComponentType,
    createContext,
    createElement,
    isValidElement,
    type ReactElement,
    type ReactNode,
    type RefObject,
    use,
    useId,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
} from "react";

/*
 * linen without Motion. An app that leaves Motion out resolves `motion` and
 * `motion/react` to this module (README, "Without Motion"), and linen moves
 * only where its stylesheet moves it: popups, dialogs, panels, toasts, the
 * rail's tips and fold, arrival marks, a refresh's turn and the theme's
 * cross-fade all stay. What Motion would carry, an arrival rising in, a
 * chosen mark sliding, rows settling, a press, lands where it would have
 * ended, as it does for a reader who asks for less motion. It stands in
 * for what linen uses of Motion and no more; the still test project runs
 * every component on it.
 */

/** The props Motion reads, which no element should be handed. */
const MOTION_PROPS = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "custom",
    "inherit",
    "whileHover",
    "whileTap",
    "whileFocus",
    "whileInView",
    "whileDrag",
    "viewport",
    "layout",
    "layoutId",
    "layoutScroll",
    "layoutRoot",
    "layoutDependency",
    "onAnimationComplete",
    "onUpdate",
    "onLayoutAnimationStart",
    "onLayoutAnimationComplete",
    "onHoverStart",
    "onHoverEnd",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onViewportEnter",
    "onViewportLeave",
    "transformTemplate",
]);

function withoutMotion(
    props: Record<string, unknown>,
): Record<string, unknown> {
    const plain: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(props)) {
        if (!MOTION_PROPS.has(name)) plain[name] = value;
    }
    return plain;
}

type Renders = string | ComponentType<Record<string, unknown>>;

const stillOf = new Map<Renders, ComponentType<Record<string, unknown>>>();

/** An element or component as itself, handed everything but Motion's props. */
function still(renders: Renders): ComponentType<Record<string, unknown>> {
    let component = stillOf.get(renders);
    if (component === undefined) {
        const made = (props: Record<string, unknown>) =>
            createElement(renders, withoutMotion(props));
        made.displayName = `still(${typeof renders === "string" ? renders : (renders.displayName ?? renders.name)})`;
        component = made;
        stillOf.set(renders, component);
    }
    return component;
}

/** `m.div`, `m.create(Component)` and the rest, without the motion. */
export const m = new Proxy(
    {},
    {
        get: (_, name: string) =>
            name === "create"
                ? (renders: Renders) => still(renders)
                : still(name),
    },
) as Record<string, ComponentType<Record<string, unknown>>> & {
    create: (renders: Renders) => ComponentType<Record<string, unknown>>;
};

export const motion = m;

/**
 * Whether a child of `AnimatePresence` is still wanted, and how a part of it
 * that asked to finish its own exit says it has.
 */
interface Presence {
    present: boolean;
    waitFor: (id: string) => () => void;
    finished: (id: string) => void;
}

const PresenceContext = createContext<Presence | null>(null);

/**
 * One child of `AnimatePresence`. Leaving, it stays on the page while any
 * part of it that asked (`usePresence`) is still finishing its own exit, such
 * as a dialog's leave in the stylesheet, and goes once none is; a child
 * whose parts never asked goes at once.
 */
function PresenceChild({
    present,
    onGone,
    children,
}: {
    present: boolean;
    onGone: () => void;
    children: ReactNode;
}) {
    const waiting = useRef(new Set<string>());
    const gone = useRef(onGone);
    gone.current = onGone;
    const presence = useMemo<Presence>(
        () => ({
            present,
            waitFor: (id) => {
                waiting.current.add(id);
                return () => waiting.current.delete(id);
            },
            finished: (id) => {
                waiting.current.delete(id);
                if (!present && waiting.current.size === 0) gone.current();
            },
        }),
        [present],
    );
    // A part that waits says so as it lays out, before this runs.
    useLayoutEffect(() => {
        if (!present && waiting.current.size === 0) gone.current();
    }, [present]);
    return <PresenceContext value={presence}>{children}</PresenceContext>;
}

/**
 * Keeps a leaving child until it has finished leaving, as Motion's does:
 * at once for one with no exit of its own, after the stylesheet's exit for
 * one that waits on it.
 */
export function AnimatePresence({ children }: { children?: ReactNode }) {
    const shown = Children.toArray(children).filter(isValidElement);
    const last = useRef(new Map<string | null, ReactElement>());
    const order = useRef<(string | null)[]>([]);
    const [, forget] = useReducer((n: number) => n + 1, 0);
    const keys = new Set(shown.map((child) => child.key));
    for (const child of shown) last.current.set(child.key, child);
    // The children in the order they come now, each leaving one kept where
    // it last stood; one list, so a child that starts to leave is the same
    // element it was, not a new one.
    const listed = shown.map((child) => child.key);
    order.current.forEach((key, at) => {
        if (!keys.has(key) && last.current.has(key)) {
            listed.splice(Math.min(at, listed.length), 0, key);
        }
    });
    order.current = listed;
    return (
        <>
            {listed.map((key) => (
                <PresenceChild
                    key={key}
                    present={keys.has(key)}
                    onGone={() => {
                        last.current.delete(key);
                        forget();
                    }}
                >
                    {last.current.get(key)}
                </PresenceChild>
            ))}
        </>
    );
}

/** Whether this part is still wanted, and how it says its exit has finished. */
export function usePresence(
    subscribe = true,
): [true, null] | [false, () => void] {
    const presence = use(PresenceContext);
    const id = useId();
    // Only a part that asks is waited for.
    useLayoutEffect(
        () => (subscribe ? presence?.waitFor(id) : undefined),
        [presence, id, subscribe],
    );
    if (presence === null || presence.present) return [true, null];
    return [
        false,
        () => {
            if (subscribe) presence.finished(id);
        },
    ];
}

export function useIsPresent(): boolean {
    return use(PresenceContext)?.present ?? true;
}

/** An animation that has already ended: it changes nothing and has finished. */
function ended(): Promise<void> & { stop: () => void; complete: () => void } {
    return Object.assign(Promise.resolve(), {
        stop: () => undefined,
        complete: () => undefined,
    });
}

export function useAnimate<Element = HTMLElement>(): [
    RefObject<Element | null>,
    typeof ended,
] {
    return [useRef<Element>(null), ended];
}

export const animate = ended;

export function LazyMotion({ children }: { children?: ReactNode }) {
    return children;
}

export function MotionConfig({ children }: { children?: ReactNode }) {
    return children;
}

export const domMax = {};
export const domAnimation = {};

/** What a test sets on Motion's own config has nothing here to reach. */
export const MotionGlobalConfig: Record<string, unknown> = {};
