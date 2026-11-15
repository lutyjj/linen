import {
    cloneElement,
    Fragment,
    isValidElement,
    type ReactElement,
    type ReactNode,
    useLayoutEffect,
    useRef,
} from "react";

import { classes } from "../foundation/classes";
import { COLUMN_CLASS } from "../foundation/column";
import { type Tone, TONE_TINT } from "../foundation/tone";
import { ToneIcon } from "./toneIcon";

interface ConditionProps {
    tone?: Tone;
    /** What holds, in one sentence, such as that contact is lost. */
    title: ReactNode;
    /** What it means or how long it has held (`Elapsed`). */
    description?: ReactNode;
    /** The one thing to do about it. */
    action?: ReactNode;
    /** Something is under way, as an operation in progress: the mark turns. */
    active?: boolean;
}

/**
 * A condition of the whole app, such as lost contact, an operation under
 * way, or a mode that does less than it should: one band across the
 * screen, in its tone, which stands on every screen until the app takes it
 * away. It stands inside `Conditions`.
 */
export function Condition({
    tone = "accent",
    title,
    description,
    action,
    active = false,
}: ConditionProps) {
    return (
        <div className={classes("border-b border-border", TONE_TINT[tone])}>
            <div
                className={classes(
                    COLUMN_CLASS,
                    "flex flex-wrap items-center gap-x-2.5 gap-y-1.5 py-2 text-sm",
                )}
            >
                <ToneIcon tone={tone} active={active} />
                <div className="flex min-w-0 flex-[1_1_14rem] flex-wrap items-baseline gap-x-2">
                    <span className="font-medium break-words">{title}</span>
                    {description !== undefined && (
                        <span className="text-text-secondary">
                            {description}
                        </span>
                    )}
                </div>
                {action !== undefined && (
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Which conditions stand first: the ones a person must act on soonest. */
const ORDER: Record<Tone, number> = {
    danger: 0,
    warn: 1,
    accent: 2,
    positive: 3,
};

function toneOf(child: ReactElement): Tone {
    return (child.props as ConditionProps).tone ?? "accent";
}

/** A list of children, an array or any other iterable, as React takes one. */
function isList(node: ReactNode): node is Iterable<ReactNode> {
    return (
        typeof node === "object" &&
        node !== null &&
        !isValidElement(node) &&
        Symbol.iterator in node
    );
}

/**
 * The conditions given, out of any fragments and lists that group them, each
 * keyed by the place it stands in: a slot keeps its key while a condition
 * before it comes and goes, as an empty slot still counts, so a condition
 * keeps the parts it drew, and what has focus in them, under React and
 * Preact alike. A condition the app keyed keeps its own key.
 */
function standingIn(children: ReactNode, path = ""): ReactElement[] {
    const slots = isList(children) ? [...children] : [children];
    return slots.flatMap((child: ReactNode, index): ReactElement[] => {
        if (isList(child)) return standingIn(child, `${path}/${index}`);
        if (!isValidElement(child)) return [];
        const key = `${path}/${child.key == null ? index : `k${child.key}`}`;
        return child.type === Fragment
            ? standingIn(
                  (child.props as { children?: ReactNode }).children,
                  key,
              )
            : [cloneElement(child, { key })];
    });
}

/**
 * Where the app's conditions stand: at the top of the screen, stuck there
 * as it scrolls, with the screen's own bars stuck beneath them. While two
 * or more hold, they stand one under another, a failure first, then a
 * warning, then what is under way or simply so, and last what came good,
 * each with its own action. The place is said politely: a condition that
 * arrives is read out once, and a count that ticks inside one is not.
 *
 * `Shell` holds one; a screen outside the shell puts one at its top.
 */
export function Conditions({
    className,
    children,
}: {
    className?: string;
    /** Each a `Condition`, given while it holds. */
    children?: ReactNode;
}) {
    const place = useRef<HTMLDivElement>(null);
    // Its height, for the bars that stick beneath it on the same screen, set
    // on the screen it heads so it leaves with it.
    useLayoutEffect(() => {
        const element = place.current;
        const screen = element?.parentElement;
        if (element == null || screen == null) return;
        const observer = new ResizeObserver(() => {
            screen.style.setProperty(
                "--height-conditions",
                `${element.offsetHeight}px`,
            );
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            screen.style.removeProperty("--height-conditions");
        };
    }, []);
    const standing = standingIn(children).sort(
        (one, other) => ORDER[toneOf(one)] - ORDER[toneOf(other)],
    );
    return (
        <div
            ref={place}
            role="status"
            className={classes("sticky top-(--inset-top) z-6", className)}
        >
            {standing}
        </div>
    );
}
