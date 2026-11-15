import { Popover } from "@base-ui/react/popover";
import { Ellipsis } from "lucide-react";
import {
    type ComponentProps,
    createContext,
    type ReactNode,
    use,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { classes } from "../foundation/classes";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
import { useWords } from "../foundation/words";
import { useNavigation } from "../navigation/navigation";
import { COLUMN_CLASS, SCREEN_TITLE_CLASS, WIDE_COLUMN_CLASS } from "./column";

/**
 * What the shell puts before every screen's title. A top bar outside a shell
 * has nothing there, which is why this is context rather than a prop each
 * screen would have to pass along.
 */
export const TopBarLead = createContext<ReactNode>(null);

/** A screen above the one shown, which its trail leads back to. */
export interface Crumb {
    /** A path from the root, such as `/settings/people`. */
    href: string;
    label: string;
}

/** How many of the nearest steps a trail shows; the ones before them fold. */
const SHOWN_STEPS = 2;

/**
 * The screens above this one, outermost first, each a link, small and quiet
 * over the title, which ends the trail as the heading it already is. A trail
 * deeper than two steps folds the outer ones behind one button, so it stays
 * one short line at any depth; the outermost is most often the place the
 * navigation already marks.
 */
function Trail({ crumbs }: { crumbs: readonly Crumb[] }) {
    const words = useWords();
    const { Link } = useNavigation();
    const folded = crumbs.slice(0, -SHOWN_STEPS);
    const shown = crumbs.slice(-SHOWN_STEPS);
    return (
        <nav aria-label={words.breadcrumb} className="min-w-0">
            <ol className="flex min-w-0 items-center text-xs text-text-muted">
                {folded.length > 0 && (
                    <li className="flex shrink-0 items-center">
                        <Folded crumbs={folded} />
                        <Divider />
                    </li>
                )}
                {shown.map((crumb, step) => (
                    <li key={step} className="flex min-w-0 items-center">
                        <Link
                            href={crumb.href}
                            className="truncate rounded-input hover:text-text"
                        >
                            {crumb.label}
                        </Link>
                        <Divider />
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/**
 * The steps a deep trail folds away, behind one button that opens them as a
 * list of links: a disclosure, as a site's navigation is, rather than a menu
 * of commands. Following one closes the list, as the screen it leads to may
 * be this one with new words.
 */
function Folded({ crumbs }: { crumbs: readonly Crumb[] }) {
    const words = useWords();
    const { Link } = useNavigation();
    const [open, setOpen] = useState(false);
    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger
                aria-label={words.foldedSteps}
                className="-my-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-input hover:bg-border hover:text-text data-[popup-open]:bg-border data-[popup-open]:text-text"
            >
                <Ellipsis aria-hidden="true" className="size-3.5" />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    sideOffset={6}
                    align="start"
                    className={POSITIONER_CLASS}
                >
                    <Popover.Popup
                        render={renderLeaving}
                        aria-label={words.foldedSteps}
                        className={classes(POPUP_CLASS, "min-w-44")}
                    >
                        <Popover.Arrow className="absolute" />
                        <ol>
                            {crumbs.map((crumb, step) => (
                                <li key={step}>
                                    <Link
                                        href={crumb.href}
                                        onClick={() => setOpen(false)}
                                        className="block rounded-input px-2 py-1.5 hover:bg-accent-weak hover:text-accent"
                                    >
                                        {crumb.label}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/** The stroke between the steps of a trail, leaning as a path's does. */
function Divider() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="mx-0.5 size-3.5 shrink-0 text-border-strong"
        >
            <path
                d="M10.5 2.5 5.5 13.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Sticky chrome keeps the full name; actions wrap below it only where the
 * title would be left less than its share of the line.
 *
 * A screen beneath another, such as one record of a list, names the screens
 * above it in a trail, which takes the lead's place before the title.
 */
export function TopBar({
    title,
    trail,
    meta,
    wide = false,
    children,
}: {
    /** The screen's name; a `TitleField` may stand in for it. */
    title: ReactNode;
    /** The screens above this one, outermost first. */
    trail?: readonly Crumb[];
    /** What reads beside the name, such as a count or a state. */
    meta?: ReactNode;
    /** Spans the whole width, for a screen whose content does. */
    wide?: boolean;
    children?: ReactNode;
}) {
    const lead = use(TopBarLead);
    const bar = useRef<HTMLElement>(null);
    // Its height, for the chrome that sticks beneath it on the same screen: a
    // bar whose actions wrap grows, and a section rail stuck at the toolbar's
    // height would slide under it. It is set on the screen the bar heads, so
    // it leaves with the bar.
    useLayoutEffect(() => {
        const element = bar.current;
        const screen = element?.parentElement;
        if (element === null || screen == null) return;
        const observer = new ResizeObserver(() => {
            screen.style.setProperty(
                "--height-topbar",
                `${element.offsetHeight}px`,
            );
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            screen.style.removeProperty("--height-topbar");
        };
    }, []);
    return (
        <header
            ref={bar}
            className="sticky top-(--inset-top) z-5 border-b border-border bg-bg"
        >
            <div
                className={classes(
                    wide ? WIDE_COLUMN_CLASS : COLUMN_CLASS,
                    // A trail over the title takes the room of the padding.
                    "flex min-h-[var(--height-toolbar)] flex-wrap items-center gap-x-3 gap-y-2",
                    trail?.length ? "py-1.5" : "py-2",
                )}
            >
                {/* The name keeps a share of the line: the actions stand
                    beside it while that much is left. A trail stands over
                    the title; what reads beside the title moves below it
                    first. */}
                <div className="flex max-w-full min-w-0 flex-[1_1_12rem] flex-col">
                    {trail?.length ? <Trail crumbs={trail} /> : null}
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        {trail?.length ? null : lead}
                        <h1
                            className={classes(
                                SCREEN_TITLE_CLASS,
                                "max-w-full min-w-0 break-words",
                            )}
                        >
                            {title}
                        </h1>
                        {meta}
                    </div>
                </div>
                {children !== undefined && (
                    <div className="ml-auto flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
}

/**
 * A screen's name, editable where it stands in the top bar: the title's
 * voice, a frame only under the pointer or the keyboard, and exactly as wide
 * as its words, so what reads beside the name stays beside it. A name longer
 * than the room ends in an ellipsis until it is edited.
 */
export function TitleField({
    value,
    placeholder,
    className,
    ...props
}: Omit<ComponentProps<"input">, "size" | "value"> & { value: string }) {
    const frame =
        "rounded-button border border-transparent px-1.5 whitespace-pre";
    return (
        // The input and a hidden copy of its words share one cell, and the
        // copy sets the cell's width: an input has no width of its own words.
        // The copy ends in a space, the caret's room after the last letter.
        // The frame reaches past the words on every side, so an editable title
        // stands where a written one would and is as tall.
        <span className="-mx-1.5 -my-px inline-grid max-w-[min(32rem,calc(100%+--spacing(3)))] min-w-0 align-top">
            <span
                aria-hidden="true"
                className={classes(
                    frame,
                    "invisible col-start-1 row-start-1 overflow-hidden",
                )}
            >
                {value === "" ? placeholder : value}{" "}
            </span>
            <input
                {...props}
                value={value}
                placeholder={placeholder}
                size={1}
                className={classes(
                    frame,
                    "col-start-1 row-start-1 w-full min-w-0 bg-transparent text-ellipsis placeholder:text-text-muted hover:border-border focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none",
                    className,
                )}
            />
        </span>
    );
}
