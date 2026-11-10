import {
    type HTMLMotionProps,
    m,
    type MotionProps,
    type Variants,
} from "motion/react";
import {
    Children,
    createContext,
    isValidElement,
    type ReactNode,
    use,
    useLayoutEffect,
    useState,
} from "react";

import { classes } from "./classes";
import { EASE, seconds, useStill } from "./motion";

interface Settling {
    /** Whether rows travel when one above them leaves or arrives. */
    settles: boolean;
    /** Whether a row that was not there wears the arrival mark. */
    marks: boolean;
    ready: boolean;
    revision?: string;
}

const SettlingContext = createContext<Settling>({
    settles: false,
    marks: false,
    ready: false,
});

/**
 * The rows of a list, seen to close up when one leaves and marked where one
 * arrives, so the list does not jump under the pointer that changed it.
 *
 * `scope` is what the rows answer, such as a search, a sort, or a month.
 * Rows that change under one scope were acted on, and are seen to leave and
 * arrive; a change of scope is a different list, so the rows are drawn anew
 * and nothing travels. Without a scope nothing settles: a list that has not
 * said what it answers cannot tell an edit from a new question.
 *
 * The rows a list is given its scope with are where it starts, and only rows
 * after them arrive, so a list whose rows are still loading has no scope
 * yet: given one while it waited, it would take every row that loaded for an
 * arrival. A list that loaded empty has its scope, and marks its first row.
 *
 * `marksArrivals` is off for a list that draws only the rows in view, which
 * draws a row for the first time whenever it is scrolled to.
 *
 * Every child needs a key, which is how a row is known from one render to
 * the next, and each row is drawn by `SettlingTr` or `SettlingItem`.
 */
export function SettlingRows({
    scope,
    marksArrivals = false,
    revision,
    children,
}: {
    scope?: string;
    marksArrivals?: boolean;
    /** Full row identity list for a virtualized view, independent of scroll. */
    revision?: string;
    children: ReactNode;
}) {
    if (scope === undefined) return children;
    const identity =
        revision ??
        JSON.stringify(
            Children.toArray(children)
                .filter(isValidElement)
                .map((child) => child.key),
        );
    return (
        <RowSet key={scope} marks={marksArrivals} revision={identity}>
            {children}
        </RowSet>
    );
}

/**
 * Holds the mark from the list's first rows by their own `initial`, rather
 * than by stilling every entrance beneath it, which would still the popups
 * rows open as well.
 */
function RowSet({
    marks,
    children,
    revision,
}: {
    marks: boolean;
    children: ReactNode;
    revision: string;
}) {
    const [ready, setReady] = useState(false);
    useLayoutEffect(() => setReady(true), []);
    return (
        <SettlingContext value={{ settles: true, marks, ready, revision }}>
            {children}
        </SettlingContext>
    );
}

/**
 * The arrival mark: the weak accent, held long enough for an eye that was
 * elsewhere to find the row, then gone. It is a variable a stylesheet layers
 * over the row, so the row's own hover and selection colours stay its own.
 */
const ARRIVAL: Variants = {
    arriving: { "--arrival": 1 },
    settled: () => ({
        "--arrival": [1, 1, 0],
        transition: {
            type: "tween",
            duration: seconds("mark"),
            times: [0, 0.4, 1],
            ease: EASE.fade,
        },
    }),
} as const;

/** What a settling row's motion element is given. */
function useSettlingRow(): MotionProps & { className?: string } {
    const { settles, marks, ready, revision } = use(SettlingContext);
    const still = useStill();
    // Whether the row came after the list's first rows, settled once as it
    // mounts: only an arrival is ever given the mark to play. Motion replays
    // a row's animation when its effects run again, as StrictMode and a
    // Suspense boundary make them, and `initial={false}` does not hold a
    // replay back.
    const [arrived] = useState(ready);
    // A cancelled entrance stays finished when motion is enabled again.
    const [arrivalAllowed, setArrivalAllowed] = useState(!still);
    if (still && arrivalAllowed) setArrivalAllowed(false);
    if (!settles) return {};
    const marked = arrived && arrivalAllowed;
    return {
        // The row moves from where it stood by a transform, which lays
        // nothing out again; only its position is carried, never its size.
        layout: still ? false : "position",
        layoutDependency: revision,
        ...(marks
            ? {
                  className: "arrival",
                  variants: ARRIVAL,
                  initial: marked ? "arriving" : false,
                  animate: marked
                      ? "settled"
                      : { "--arrival": 0, transition: { duration: 0 } },
              }
            : {}),
    };
}

/** A table row that settles with its list, and is a plain row outside one. */
export function SettlingTr({ className, ...props }: HTMLMotionProps<"tr">) {
    const settling = useSettlingRow();
    return (
        <m.tr
            {...props}
            {...settling}
            className={classes(className, settling.className)}
        />
    );
}

/** A list item that settles with its list, and is a plain item outside one. */
export function SettlingItem({ className, ...props }: HTMLMotionProps<"div">) {
    const settling = useSettlingRow();
    return (
        <m.div
            {...props}
            {...settling}
            className={classes(className, settling.className)}
        />
    );
}
