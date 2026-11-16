import { m } from "motion/react";
import { type ReactNode, useEffect, useId, useRef } from "react";

import { classes } from "../../foundation/classes";
import { arrive } from "../../motion/arrive";
import { chosenLayerClass, ChosenMark } from "../../motion/ChosenMark";
import {
    type MotionToken,
    seconds,
    spring,
    useStill,
} from "../../motion/tokens";
import {
    useCurrent,
    useMotionLink,
    useNavigation,
} from "../../navigation/navigation";
import { type Home, HomeLink, type Place, type PlaceList } from "./places";
import { FootPlaceContext, RailContext } from "./Rail";

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
function TabBar({
    label,
    places,
    placesKey,
    foot,
}: PlaceList & { foot?: ReactNode }) {
    return (
        <nav
            aria-label={label}
            data-tab-bar=""
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sunken pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:hidden"
        >
            <div className="flex h-(--height-tabbar) items-stretch">
                {/* The places share the bar with the foot, one cell each. */}
                <m.div
                    {...arrive()}
                    key={placesKey}
                    style={{ flexGrow: places.length }}
                    className="flex basis-0 items-stretch"
                >
                    {places.map((place) => (
                        <TabLink key={place.href} {...place} />
                    ))}
                </m.div>
                {foot !== undefined && (
                    <FootPlaceContext value="bottom">
                        <RailContext value={true}>
                            <div className="flex flex-1 basis-0 items-stretch">
                                {foot}
                            </div>
                        </RailContext>
                    </FootPlaceContext>
                )}
            </div>
        </nav>
    );
}

/** A place in the tab bar: its icon over its words. */
function TabLink({ href, label, icon: Icon, exact = false, badge }: Place) {
    const { Link } = useNavigation();
    const current = useCurrent(href, exact);
    return (
        <Link
            href={href}
            aria-current={current ? "page" : undefined}
            className={classes(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-3xs",
                current ? "font-medium text-accent" : "text-text-secondary",
            )}
        >
            <Icon aria-hidden="true" className="size-5" />
            {label}
            {badge !== undefined && (
                <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-[calc(50%-16px)] size-2 rounded-full bg-warn"
                />
            )}
        </Link>
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
    foot,
}: PlaceList & { home: Home; wordmark: ReactNode; foot?: ReactNode }) {
    const group = useId();
    const scroller = useRef<HTMLDivElement>(null);
    const pathname = useNavigation().usePathname();
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
                                key={place.href}
                                group={group}
                                {...place}
                            />
                        ))}
                    </m.div>
                </m.div>
                {foot !== undefined && (
                    <FootPlaceContext value="top">
                        <RailContext value={true}>
                            <div className="flex shrink-0 items-center">
                                {foot}
                            </div>
                        </RailContext>
                    </FootPlaceContext>
                )}
            </div>
        </nav>
    );
}

/** How long the places of the top bar take to make room for a chosen one. */
const MAKE_ROOM: MotionToken = "state";

/**
 * A place in the top bar. The current one wears its words and the chosen
 * mark, which slides to the next place chosen while the others make room;
 * the rest show their icons and keep their words for assistive technology,
 * so the bar fits a phone's width.
 *
 * The chosen place takes its full width at once and the others slide out of
 * its way, so its words wait as long as the places take to make room, and
 * only then fade in. The wait is a time, not the room itself: a main thread
 * that stalls during the move lets them in early.
 */
function TopNavLink({
    href,
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
    const MotionLink = useMotionLink();
    const current = useCurrent(href, exact);
    return (
        <MotionLink
            layout={still ? false : "position"}
            transition={spring(MAKE_ROOM)}
            href={href}
            aria-current={current ? "page" : undefined}
            className={classes(
                "relative flex h-(--height-control) shrink-0 items-center gap-1.5 rounded-button px-2 text-sm whitespace-nowrap",
                chosenLayerClass(current),
                current
                    ? "font-medium text-accent"
                    : "text-text-secondary hover:bg-border hover:text-text",
            )}
        >
            {current && <ChosenMark group={group} radius="button" />}
            <Icon aria-hidden="true" className="relative size-4 shrink-0" />
            {current ? (
                <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        ...spring("enter"),
                        delay: seconds(MAKE_ROOM),
                    }}
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
                        current ? "bg-accent" : "bg-warn",
                    )}
                />
            )}
        </MotionLink>
    );
}

/** The phone's navigation, wherever the app puts it. */
export function PhoneNavigation({
    at,
    home,
    wordmark,
    foot,
    ...navigation
}: PlaceList & {
    at: PhoneNav;
    home: Home;
    wordmark: ReactNode;
    /** The rail's foot, at the end of the bar: a phone has no rail. */
    foot?: ReactNode;
}) {
    switch (at) {
        case "bottom":
            return <TabBar {...navigation} foot={foot} />;
        case "top":
            return (
                <TopNav
                    {...navigation}
                    home={home}
                    wordmark={wordmark}
                    foot={foot}
                />
            );
    }
}
