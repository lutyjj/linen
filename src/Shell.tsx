import { Popover } from "@base-ui/react/popover";
import { ChevronsLeft, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { m, useAnimate } from "motion/react";
import {
    createContext,
    type ReactNode,
    use,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { Link, NavLink, useLocation } from "react-router";

import { classes } from "./classes";
import { arrive, renderLeaving, spring, useStill } from "./motion";
import { POPUP_CLASS, POSITIONER_CLASS } from "./Popup";
import { chosenLayerClass, ChosenMark } from "./SegmentedControl";
import { TopBarLead } from "./TopBar";
import { useWords } from "./words";

/** A place the navigation leads to. */
export interface Place {
    to: string;
    label: string;
    icon: LucideIcon;
    /** Where the link is active only on its own address, not beneath it. */
    exact?: boolean;
    /** A count waiting for a hand, worn after the words or as a dot. */
    badge?: string;
}

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
        "group/item relative flex h-(--height-control) w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-button px-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-45",
        active
            ? "bg-accent-weak font-medium text-accent"
            : "text-text-secondary hover:bg-border hover:text-text",
    );
}

/*
 * A row's words, in one of two places. Beside the icon in the full rail; in
 * the compact one, a tip that arrives while the row is hovered or focused.
 * Either way they stay in the row, so a link keeps its accessible name in
 * both widths.
 */
const LABEL_CLASS = "min-w-0 flex-1 truncate";
const TIP_CLASS =
    "pointer-events-none absolute inset-y-0 left-full my-auto ml-2 h-fit rounded-input bg-text px-2 py-1 text-xs font-medium whitespace-nowrap text-bg shadow-overlay group-data-popup-open/item:invisible";

const MotionNavLink = m.create(NavLink);

function RailLabel({
    compact,
    children,
}: {
    compact: boolean;
    children: ReactNode;
}) {
    return (
        <m.span
            className={compact ? TIP_CLASS : LABEL_CLASS}
            initial={false}
            animate="rest"
            variants={{
                rest: {
                    opacity: compact ? 0 : 1,
                    x: compact ? -4 : 0,
                    transition: compact ? { duration: 0 } : spring("enter"),
                },
                hint: { opacity: 1, x: 0, transition: spring("enter") },
            }}
        >
            {children}
        </m.span>
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

function RailLink({ to, icon, label, exact = false, badge }: Place) {
    return (
        <MotionNavLink
            whileHover="hint"
            whileFocus="hint"
            to={to}
            end={exact}
            className={({ isActive }) => railItemClass(isActive)}
        >
            {({ isActive }) => (
                <RailRow icon={icon} label={label}>
                    {badge !== undefined && (
                        <RailBadge active={isActive} count={badge} />
                    )}
                </RailRow>
            )}
        </MotionNavLink>
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
        <m.button
            whileHover="hint"
            whileFocus="hint"
            type="button"
            onClick={() => setCompact(!compact)}
            className={classes(
                railItemClass(false),
                "w-(--height-control) justify-center px-0",
            )}
        >
            <m.span
                initial={false}
                animate={{ rotate: compact ? 180 : 0 }}
                className="flex"
            >
                <ChevronsLeft aria-hidden="true" className="size-4" />
            </m.span>
            <RailLabel compact>
                {compact ? words.expandRail : words.collapseRail}
            </RailLabel>
        </m.button>
    );
}

/**
 * A choice the rail offers as a segmented control. Too wide for the compact
 * rail, where a row wearing the choice's icon opens it beside the rail
 * instead.
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
                render={<m.button whileHover="hint" whileFocus="hint" />}
                className={railItemClass(false)}
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
                        aria-label={label}
                        className={classes(POPUP_CLASS, "p-2")}
                    >
                        <Popover.Arrow className="absolute" />
                        {children}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/**
 * Who is signed in, and what they have chosen for this browser, with the way
 * out under it.
 *
 * One control at the foot of the rail rather than loose ones: it reads as the
 * person, and opening it shows what belongs to them. A shared machine's next
 * person looks for their own name to leave by, and finds the way out under
 * it. The phone has no rail, so the app's settings hold the same choices.
 */
export function AccountMenu({
    name,
    caption,
    label,
    menuLabel,
    children,
    footer,
}: {
    name: string;
    /** A line under the name in the menu, such as how the person signs in. */
    caption?: ReactNode;
    /** The trigger's name, which says who is signed in. */
    label: string;
    /** The menu's own name. */
    menuLabel: string;
    /** The choices, each a `MenuChoice`. */
    children?: ReactNode;
    /** The way out. */
    footer?: ReactNode;
}) {
    const compact = useRailCompact();
    const initial = name.slice(0, 1).toUpperCase();
    return (
        <Popover.Root>
            <Popover.Trigger
                render={<m.button whileHover="hint" whileFocus="hint" />}
                aria-label={label}
                className={classes(
                    railItemClass(false),
                    "h-10 data-[popup-open]:bg-border data-[popup-open]:text-text",
                    compact ? "justify-center px-0" : "pl-1",
                )}
            >
                <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-weak text-xs font-semibold text-accent"
                >
                    {initial}
                </span>
                {!compact && (
                    <>
                        <span className="min-w-0 flex-1 truncate font-medium text-text">
                            {name}
                        </span>
                        <ChevronsUpDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                        />
                    </>
                )}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    side={compact ? "right" : "top"}
                    align={compact ? "end" : "start"}
                    sideOffset={8}
                    className={POSITIONER_CLASS}
                >
                    <Popover.Popup
                        render={renderLeaving}
                        aria-label={menuLabel}
                        className={classes(POPUP_CLASS, "w-64 p-0")}
                    >
                        <Popover.Arrow className="absolute" />
                        <div className="border-b border-border px-3 py-2.5">
                            <div className="truncate text-sm font-medium">
                                {name}
                            </div>
                            {caption !== undefined && (
                                <div className="text-xs text-text-muted">
                                    {caption}
                                </div>
                            )}
                        </div>
                        {children !== undefined && (
                            <div className="flex flex-col gap-3 px-3 py-3">
                                {children}
                            </div>
                        )}
                        {footer !== undefined && (
                            <div className="border-t border-border p-2">
                                {footer}
                            </div>
                        )}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/** A choice inside the account menu, under the word for what it chooses. */
export function MenuChoice({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5 [&_[role=radio]]:flex-1 [&>[role=radiogroup]]:flex">
            <span aria-hidden="true" className="text-xs text-text-secondary">
                {label}
            </span>
            {children}
        </div>
    );
}

/** The app's first screen, and the app's name, which names the way there. */
export interface Home {
    to: string;
    label: string;
}

/**
 * The wordmark or the mark, leading to the app's first screen from wherever
 * the person is, as a product's name does on every site.
 */
function HomeLink({ home, children }: { home: Home; children: ReactNode }) {
    return (
        <Link
            to={home.to}
            aria-label={home.label}
            className="-m-1 flex shrink-0 items-center rounded-button p-1"
        >
            {children}
        </Link>
    );
}

interface Navigation {
    /** Names the navigation, apart from a screen's own section navigation. */
    label: string;
    places: readonly Place[];
    /**
     * Which group of places is shown. A change of it brings the new places in
     * together rather than each row trading words with the one that stood
     * there.
     */
    placesKey?: string;
}

/**
 * The desk's navigation, full width or folded to its icons. Folded, the
 * content takes the width the words gave up.
 */
function Rail({
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
}: Navigation & {
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
                    {sign != null && <HomeLink home={home}>{sign}</HomeLink>}
                    {!folded && (
                        <RailFold compact={compact} setCompact={setChosen} />
                    )}
                </div>

                {head !== undefined && (
                    <div className={classes(!compact && "pb-3")}>{head}</div>
                )}

                <m.div
                    {...arrive()}
                    key={placesKey}
                    className="flex flex-col gap-0.5"
                >
                    {places.map((place) => (
                        <RailLink key={place.to} {...place} />
                    ))}
                </m.div>

                {foot !== undefined && (
                    <div className="mt-auto border-t border-border pt-3">
                        {foot}
                    </div>
                )}
            </nav>
        </RailContext>
    );
}

/**
 * Where a phone shows the places: a tab bar along the bottom, within the
 * thumb's reach, or a bar along the top that leaves the whole screen below
 * it to the content.
 */
export type PhoneNav = "bottom" | "top";

/**
 * The phone's navigation: the places as a tab bar the thumb can reach,
 * padded past the home indicator. Toasts stand above it while it is on the
 * page (`data-tab-bar`, read by linen.css).
 */
function TabBar({ label, places, placesKey }: Navigation) {
    return (
        <nav
            aria-label={label}
            data-tab-bar=""
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sunken pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:hidden"
        >
            <m.div
                {...arrive()}
                key={placesKey}
                className="flex h-(--height-tabbar) items-stretch"
            >
                {places.map(({ to, label, icon: Icon, exact, badge }) => (
                    <MotionNavLink
                        whileHover="hint"
                        whileFocus="hint"
                        key={to}
                        to={to}
                        end={exact}
                        className={({ isActive }) =>
                            classes(
                                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-3xs",
                                isActive
                                    ? "font-medium text-accent"
                                    : "text-text-secondary",
                            )
                        }
                    >
                        <Icon aria-hidden="true" className="size-5" />
                        {label}
                        {badge !== undefined && (
                            <span
                                aria-hidden="true"
                                className="absolute top-1.5 right-[calc(50%-16px)] size-2 rounded-full bg-warn"
                            />
                        )}
                    </MotionNavLink>
                ))}
            </m.div>
        </nav>
    );
}

/**
 * The phone's navigation along the top: the wordmark, then the places. It
 * scrolls away with the page, so the screen's own top bar is the one band
 * that stays.
 */
function TopNav({
    label,
    places,
    placesKey,
    home,
    wordmark,
}: Navigation & { home: Home; wordmark: ReactNode }) {
    const group = useId();
    const scroller = useRef<HTMLDivElement>(null);
    const { pathname } = useLocation();
    // The current place scrolls into the bar's view, and only the bar
    // scrolls: the bar scrolls away with the page, and bringing the place
    // into the window's view would move the page back up to it. Offsets are
    // where the place is laid out, not where a transform draws it on its way,
    // and the row's padding, the focus ring's room, comes into view with it.
    useEffect(() => {
        const bar = scroller.current;
        const place = bar?.querySelector<HTMLElement>("[aria-current=page]");
        if (bar == null || place?.parentElement == null) return;
        const room = parseFloat(
            getComputedStyle(place.parentElement).paddingLeft,
        );
        const start = place.offsetLeft - room;
        const end = place.offsetLeft + place.offsetWidth + room;
        if (start < bar.scrollLeft) bar.scrollLeft = start;
        else if (end > bar.scrollLeft + bar.clientWidth)
            bar.scrollLeft = end - bar.clientWidth;
    }, [pathname]);
    return (
        <nav
            aria-label={label}
            className="relative z-20 -mt-(--inset-top) border-b border-border bg-sunken pt-(--inset-top) md:hidden"
        >
            <div className="flex h-(--height-toolbar) items-center gap-3 px-3">
                <HomeLink home={home}>{wordmark}</HomeLink>
                {/* Places that outgrow the phone scroll rather than widen the
                    page, so Motion is told to measure the mark inside the
                    scroll; the padding keeps a focus ring inside it. The
                    places measure their offsets from the scroller.

                    Only where the places are laid out reaches the scroll, not
                    where Motion draws them on their way, or a scrollbar would
                    come and go with every move: the bar never scrolls down,
                    where the row arrives from, and the row clips a place drawn
                    past its ends. While the places fit, the row spans the room
                    the wordmark leaves, so its ends stay put when a shorter
                    word narrows the places, and a place sliding over from
                    where it stood is drawn whole. */}
                <m.div
                    ref={scroller}
                    layoutScroll
                    className="relative -my-1 -mr-1 min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
                >
                    <m.div
                        {...arrive()}
                        key={placesKey}
                        className="isolate flex w-max min-w-full items-center justify-end gap-1 overflow-clip p-1"
                    >
                        {places.map((place) => (
                            <TopNavLink
                                key={place.to}
                                group={group}
                                {...place}
                            />
                        ))}
                    </m.div>
                </m.div>
            </div>
        </nav>
    );
}

/**
 * A place in the top bar. The current one wears its words and the chosen
 * mark, which slides to the next place chosen while the others make room;
 * the rest show their icons and keep their words for assistive technology,
 * so the bar fits a phone's width.
 */
function TopNavLink({
    to,
    label,
    icon: Icon,
    exact = false,
    badge,
    group,
}: Place & {
    /** The bar's own id, which its chosen mark travels within. */
    group: string;
}) {
    const still = useStill();
    return (
        <MotionNavLink
            layout={still ? false : "position"}
            transition={spring("state")}
            to={to}
            end={exact}
            className={({ isActive }) =>
                classes(
                    "relative flex h-(--height-control) shrink-0 items-center gap-1.5 rounded-button px-2 text-sm whitespace-nowrap",
                    chosenLayerClass(isActive),
                    isActive
                        ? "font-medium text-accent"
                        : "text-text-secondary hover:bg-border hover:text-text",
                )
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && <ChosenMark group={group} radius="button" />}
                    <Icon
                        aria-hidden="true"
                        className="relative size-4 shrink-0"
                    />
                    {isActive ? (
                        <m.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={spring("enter")}
                            className="relative"
                        >
                            {label}
                        </m.span>
                    ) : (
                        <span className="sr-only">{label}</span>
                    )}
                    {badge !== undefined && (
                        <span
                            aria-hidden="true"
                            className={classes(
                                "absolute top-1 right-1 size-2 rounded-full",
                                isActive ? "bg-accent" : "bg-warn",
                            )}
                        />
                    )}
                </>
            )}
        </MotionNavLink>
    );
}

/** The phone's navigation, wherever the app puts it. */
function PhoneNavigation({
    at,
    home,
    wordmark,
    ...navigation
}: Navigation & { at: PhoneNav; home: Home; wordmark: ReactNode }) {
    switch (at) {
        case "bottom":
            return <TabBar {...navigation} />;
        case "top":
            return <TopNav {...navigation} home={home} wordmark={wordmark} />;
    }
}

/**
 * The room the frame keeps for the phone's navigation: a fixed tab bar
 * covers the foot of the screen, and a bar along the top takes a row of its
 * own above it. Each is read, and reached by the Tab key, where it stands:
 * the top bar before the screen, the tab bar after it.
 */
const PHONE_FRAME = {
    bottom: {
        frame: "",
        main: "pb-[calc(var(--height-tabbar)+env(safe-area-inset-bottom))]",
        leads: false,
    },
    top: {
        frame: "grid-rows-[auto_1fr] md:grid-rows-none",
        main: "pb-[env(safe-area-inset-bottom)]",
        leads: true,
    },
} as const satisfies Record<
    PhoneNav,
    { frame: string; main: string; leads: boolean }
>;

/**
 * The frame every signed-in screen stands in: the rail on a desk, the phone's
 * navigation along its bottom or top edge, and the screen between them.
 *
 * The router keeps the screen being left on the page until the next one has
 * drawn; the new one then fades in where it stands, live from its first
 * frame, so a tap during the fade lands on what it shows.
 */
export function Shell({
    label,
    places,
    placesKey,
    home,
    wordmark,
    mark,
    head,
    foot,
    lead,
    storageKey,
    folded = false,
    phoneNav = "bottom",
    screen,
    children,
}: Navigation & {
    /** Where the wordmark and the mark lead. */
    home: Home;
    /** The product's name at the head of the full rail, and of the phone's
     * top bar, which draws it a second time. */
    wordmark: ReactNode;
    /** The product's mark alone, at the head of a rail the screen folded. */
    mark?: ReactNode;
    /** A choice under the wordmark, such as which area the places belong to. */
    head?: ReactNode;
    /** The rail's foot, which the account menu takes. */
    foot?: ReactNode;
    /** What every screen's top bar puts before its title. */
    lead?: ReactNode;
    /** Where this browser keeps whether the rail is folded. */
    storageKey: string;
    /** Holds the rail at its icons, for a screen that needs the width. */
    folded?: boolean;
    /** Where a phone shows the places; the tab bar along the bottom unless
     * the app chooses the top. */
    phoneNav?: PhoneNav;
    /** Which screen the shell holds; a change of it fades the new one in. */
    screen?: string;
    children: ReactNode;
}) {
    const [main, animate] = useAnimate<HTMLElement>();
    useLayoutEffect(() => {
        void animate(main.current, { opacity: [0, 1] }, spring("enter"));
    }, [screen, animate, main]);

    const room = PHONE_FRAME[phoneNav];
    const phone = (
        <PhoneNavigation
            at={phoneNav}
            label={label}
            places={places}
            placesKey={placesKey}
            home={home}
            wordmark={wordmark}
        />
    );

    return (
        <div
            className={classes(
                "grid min-h-dvh grid-cols-1 pt-(--inset-top) pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] md:grid-cols-[auto_1fr]",
                room.frame,
            )}
        >
            {/* Under the status bar: the rail and the phone's top bar reach
                up under it in their own colour, and the page stands under it
                everywhere else, so what scrolls beneath the sticky bars does
                not show through. */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 z-10 h-(--inset-top) bg-bg"
            />
            <Rail
                label={label}
                places={places}
                placesKey={placesKey}
                home={home}
                wordmark={wordmark}
                mark={mark}
                head={head}
                foot={foot}
                storageKey={storageKey}
                folded={folded}
            />

            {room.leads && phone}

            <main
                ref={main}
                className={classes("flex min-w-0 flex-col md:pb-0", room.main)}
            >
                <TopBarLead value={lead ?? null}>{children}</TopBarLead>
            </main>

            {!room.leads && phone}
        </div>
    );
}
