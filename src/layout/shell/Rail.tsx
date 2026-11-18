import { Popover } from "@base-ui/react/popover";
import { ChevronsLeft, type LucideIcon } from "lucide-react";
import { m } from "motion/react";
import { createContext, type ReactNode, use, useState } from "react";

import { classes } from "../../foundation/classes";
import {
    POPUP_CLASS,
    POSITIONER_CLASS,
    renderLeaving,
} from "../../foundation/popup";
import { isContent } from "../../foundation/slot";
import { useWords } from "../../foundation/words";
import { arrive } from "../../motion/arrive";
import { useCurrent, useNavigation } from "../../navigation/navigation";
import { type Home, HomeLink, type Place, type PlaceList } from "./places";

/**
 * Whether the rail is folded to its icons. A preference of this browser, like
 * the theme, so a reload keeps the width the person chose; a browser that
 * refuses storage keeps it for the page's life.
 */
function useCompactRail(key: string): [boolean, (compact: boolean) => void] {
    const [compact, setCompact] = useState(() => {
        try {
            return localStorage.getItem(key) === "compact";
        } catch {
            return false;
        }
    });
    return [
        compact,
        (next) => {
            try {
                if (next) localStorage.setItem(key, "compact");
                else localStorage.removeItem(key);
            } catch {
                // Kept for this page only.
            }
            setCompact(next);
        },
    ];
}

/** Whether the rail stands folded to its icons, for every row inside it. */
const RailContext = createContext(false);

export function useRailCompact(): boolean {
    return use(RailContext);
}

/** Every row of the rail, whether it leads somewhere or does something. */
export function railItemClass(active: boolean): string {
    return classes(
        "group/item relative flex h-(--height-control) w-full shrink-0 items-center gap-2.5 rounded-button px-2 text-left text-sm pressable:cursor-pointer inactive:dimmed",
        active
            ? "bg-accent-weak font-medium text-accent"
            : "text-text-secondary pressable:hover:bg-border pressable:hover:text-text",
    );
}

/*
 * A row's words, in one of two places. Beside the icon in the full rail; in
 * the compact one, a tip that arrives while the row is hovered or focused.
 * Either way they stay in the row, so a link keeps its accessible name in
 * both widths.
 */
const LABEL_CLASS = "rail-label min-w-0 flex-1 truncate";
const TIP_CLASS =
    "rail-tip pointer-events-none absolute inset-y-0 left-full my-auto ml-2 h-fit rounded-input bg-text px-2 py-1 text-xs font-medium whitespace-nowrap text-bg shadow-overlay group-data-popup-open/item:invisible";

function RailLabel({
    compact,
    children,
}: {
    compact: boolean;
    children: ReactNode;
}) {
    return (
        <span className={compact ? TIP_CLASS : LABEL_CLASS}>{children}</span>
    );
}

/** A row's icon and words, which fold into a tip with the rail. */
export function RailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: ReactNode;
    /** Anything the row wears after its words, such as a badge. */
    children?: ReactNode;
}) {
    const compact = useRailCompact();
    return (
        <>
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <RailLabel compact={compact}>{label}</RailLabel>
            {children}
        </>
    );
}

/**
 * A count after the words, or a dot on the icon once the words have folded
 * away. Decoration for the eye either way: the words are the link's name, and
 * a count folded into it would rename it.
 */
function RailBadge({ active, count }: { active: boolean; count: string }) {
    const compact = useRailCompact();
    return (
        <span
            aria-hidden="true"
            className={classes(
                compact
                    ? "absolute top-1 right-1 size-2 rounded-full"
                    : "rounded-input px-1.25 text-2xs text-bg",
                active ? "bg-accent" : "bg-warn",
            )}
        >
            {!compact && count}
        </span>
    );
}

function RailLink({ href, icon, label, exact = false, badge }: Place) {
    const { Link } = useNavigation();
    const current = useCurrent(href, exact);
    return (
        <Link
            href={href}
            aria-current={current ? "page" : undefined}
            className={railItemClass(current)}
        >
            <RailRow icon={icon} label={label}>
                {badge !== undefined && (
                    <RailBadge active={current} count={badge} />
                )}
            </RailRow>
        </Link>
    );
}

/**
 * Folds the rail to its icons and back. It keeps its place in the header,
 * so the rows below never move, and its chevron turns to point the way the
 * rail will go.
 */
function RailFold({
    compact,
    setCompact,
}: {
    compact: boolean;
    setCompact: (compact: boolean) => void;
}) {
    const words = useWords();
    return (
        <button
            type="button"
            onClick={() => setCompact(!compact)}
            className={classes(
                railItemClass(false),
                "w-(--height-control) justify-center px-0",
            )}
        >
            <span
                className={classes("rail-fold flex", compact && "rotate-180")}
            >
                <ChevronsLeft aria-hidden="true" className="size-4" />
            </span>
            <RailLabel compact>
                {compact ? words.expandRail : words.collapseRail}
            </RailLabel>
        </button>
    );
}

/**
 * A choice the rail offers as a segmented control. Too wide for the compact
 * rail, where a row wearing the choice's icon opens it beside the rail
 * instead, under the choice's name.
 */
export function RailChoice({
    icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    /** The segmented control itself. */
    children: ReactNode;
}) {
    const compact = useRailCompact();
    if (!compact) return <div className="px-2">{children}</div>;
    return (
        <Popover.Root>
            <Popover.Trigger
                render={<button />}
                className={classes(
                    railItemClass(false),
                    "data-[popup-open]:bg-border data-[popup-open]:text-text",
                )}
            >
                <RailRow icon={icon} label={label} />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    side="right"
                    align="start"
                    sideOffset={8}
                    className={POSITIONER_CLASS}
                >
                    <Popover.Popup
                        render={renderLeaving}
                        className={classes(
                            POPUP_CLASS,
                            "flex flex-col gap-1.5 p-2",
                        )}
                    >
                        <Popover.Arrow className="absolute" />
                        <Popover.Title className="text-xs text-text-secondary">
                            {label}
                        </Popover.Title>
                        {children}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/**
 * The desk's navigation, full width or folded to its icons. Folded, the
 * content takes the width the words gave up.
 */
export function Rail({
    label,
    places,
    placesKey,
    home,
    wordmark,
    mark,
    head,
    foot,
    storageKey,
    folded,
}: PlaceList & {
    home: Home;
    wordmark: ReactNode;
    mark?: ReactNode;
    head?: ReactNode;
    foot?: ReactNode;
    storageKey: string;
    folded: boolean;
}) {
    const [chosen, setChosen] = useCompactRail(storageKey);
    const compact = folded || chosen;
    // The full rail heads with the wordmark, a rail the screen folded with the
    // mark alone; one the person folded leaves the room to the fold's button.
    const sign = compact ? (folded ? mark : undefined) : wordmark;

    return (
        <RailContext value={compact}>
            <nav
                aria-label={label}
                className={classes(
                    "sticky top-0 z-20 -mt-(--inset-top) hidden h-dvh w-(--width-rail) flex-col gap-0.5 border-r border-border bg-sunken px-3 pt-[calc(var(--inset-top)+--spacing(5))] pb-5 md:flex",
                    compact && "w-(--width-rail-compact)",
                )}
            >
                <div
                    className={classes(
                        "flex min-h-(--height-control) items-center justify-between pb-4",
                        !compact && "pl-2",
                        compact && folded && "justify-center",
                    )}
                >
                    {isContent(sign) && <HomeLink home={home}>{sign}</HomeLink>}
                    {!folded && (
                        <RailFold compact={compact} setCompact={setChosen} />
                    )}
                </div>

                {isContent(head) && (
                    <div className={classes(!compact && "pb-3")}>{head}</div>
                )}

                <m.div
                    {...arrive()}
                    key={placesKey}
                    className="flex flex-col gap-0.5"
                >
                    {places.map((place) => (
                        <RailLink key={place.href} {...place} />
                    ))}
                </m.div>

                {isContent(foot) && (
                    <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                        {foot}
                    </div>
                )}
            </nav>
        </RailContext>
    );
}
