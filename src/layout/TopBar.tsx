import { Popover } from "@base-ui/react/popover";
import { ChevronLeft, Ellipsis } from "lucide-react";
import {
    type ComponentProps,
    createContext,
    type ReactNode,
    use,
    useState,
} from "react";

import { buttonClass } from "../controls/Button";
import { classes } from "../foundation/classes";
import { COLUMN_CLASS, WIDE_COLUMN_CLASS } from "../foundation/column";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../foundation/popup";
import { isContent } from "../foundation/slot";
import { useStickyBar } from "../foundation/viewport";
import { useWords } from "../foundation/words";
import { useNavigation } from "../navigation/navigation";
import { SCREEN_TITLE_CLASS } from "./column";

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

/**
 * The screens above this one in a bar 50rem wide or more, outermost first,
 * small and quiet before the title, which ends the trail as the heading it
 * already is: two steps as links, or the nearest one after a button the
 * outer ones fold behind once there are two or more of them. It gives way
 * before the title's share: it takes the room the title leaves, down to
 * about the longest word of each step, which ends in an ellipsis there.
 */
function Trail({ crumbs }: { crumbs: readonly Crumb[] }) {
    const words = useWords();
    const { Link } = useNavigation();
    const folds = crumbs.length > 2;
    return (
        // The last slash stands as far from the title as from the step
        // before it, its own margin rather than the bar's gap.
        <nav
            aria-label={words.breadcrumb}
            className="-mr-3 hidden max-w-max grow basis-0 self-baseline @[50rem]:block"
        >
            <ol className="flex items-baseline text-sm text-text-muted">
                {folds && (
                    <li className="flex shrink-0 items-center self-center">
                        <Folded crumbs={crumbs.slice(0, -1)} />
                        <Divider />
                    </li>
                )}
                {(folds ? crumbs.slice(-1) : crumbs).map((crumb) => (
                    <li key={crumb.href} className="flex items-baseline">
                        <Link
                            href={crumb.href}
                            className="line-clamp-1 rounded-input hover:text-text"
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
 * The way up a level in a narrower bar, where the lead stands: a
 * chevron in a control's frame, named for the screen it leads to. The place
 * above is most often the one the tab bar already marks.
 */
function Back({ crumb }: { crumb: Crumb }) {
    const { Link } = useNavigation();
    return (
        <Link
            href={crumb.href}
            className={classes(buttonClass(), "aspect-square px-0")}
        >
            <ChevronLeft aria-hidden="true" className="size-4" />
            <span className="sr-only">{crumb.label}</span>
        </Link>
    );
}

/**
 * The outer steps of a trail, behind one button that opens them as a
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
            className="mx-2.5 size-3.5 shrink-0 self-center text-border-strong"
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
 * title and what reads beside it would be left less than their share of the
 * line, or less than their own width where that is narrower.
 *
 * A screen beneath another, such as one record of a list, names the screens
 * above it in a trail before the title while the bar is 50rem wide or more,
 * and leads up a level from the lead's place in a narrower one. The bar
 * decides from its own width, so it stands where it is given one, as a
 * block does, and a folded rail gives it the trail sooner.
 *
 * It stands at the top of a screen, and what follows it comes to rest below
 * it when it is scrolled to. Drawn in a box that scrolls, as a sample in a
 * frame is, it is the box's and the page keeps nothing clear of it.
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
    const nearest = trail?.at(-1);
    const before = nearest ? <Back crumb={nearest} /> : lead;
    // Its height, for the sections stuck beneath it and what scrolls there.
    const bar = useStickyBar<HTMLElement>("--height-topbar");
    return (
        <header
            ref={bar}
            className="@container sticky top-[calc(var(--inset-top)+var(--height-conditions,0px))] z-5 border-b border-border bg-bg"
        >
            {/* Everything stands on the title's first line, a control's
                height: the lead and the actions centred on it, the trail on
                its baseline. */}
            <div
                className={classes(
                    wide ? WIDE_COLUMN_CLASS : COLUMN_CLASS,
                    "flex min-h-[var(--height-toolbar)] flex-wrap items-start gap-x-3 gap-y-2 py-2",
                )}
            >
                {trail?.length ? <Trail crumbs={trail} /> : null}
                {/* The name and what reads beside it keep a share of the
                    line, or their own width where that is less, and grow
                    before the trail does: the actions stand beside them
                    while that much is left. A lead or the way up stands
                    inside that share, so on a phone the name gives way
                    before the actions wrap and the bar keeps its height.
                    Past that share, what reads beside the title moves
                    under it first. */}
                <div className="flex max-w-max min-w-0 flex-[999_1_12rem] items-start self-baseline">
                    {isContent(before) && (
                        <div
                            className={classes(
                                "flex h-(--height-control) shrink-0 items-center *:mr-3",
                                nearest && "@[50rem]:hidden",
                            )}
                        >
                            {before}
                        </div>
                    )}
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <h1
                            className={classes(
                                SCREEN_TITLE_CLASS,
                                "min-w-0 py-[calc((var(--height-control)-1lh)/2)] break-words",
                            )}
                        >
                            {title}
                        </h1>
                        {meta}
                    </div>
                </div>
                {isContent(children) && (
                    <div className="ml-auto flex min-h-(--height-control) max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
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
