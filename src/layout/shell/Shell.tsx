import { useAnimate } from "motion/react";
import { type ReactNode, useLayoutEffect } from "react";

import { type Condition, Conditions } from "../../feedback/Conditions";
import { classes } from "../../foundation/classes";
import { spring } from "../../motion/tokens";
import { TopBarLead } from "../TopBar";
import { type PhoneNav, PhoneNavigation } from "./PhoneNav";
import { type Home, type PlaceList } from "./places";
import { Rail } from "./Rail";

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
    conditions,
    children,
}: PlaceList & {
    /** Where the wordmark and the mark lead. */
    home: Home;
    /** The product's name at the head of the full rail, and of the phone's
     * top bar, which draws it a second time. */
    wordmark: ReactNode;
    /** The product's mark alone, at the head of a rail the screen folded. */
    mark?: ReactNode;
    /** A choice under the wordmark, such as which area the places belong to. */
    head?: ReactNode;
    /**
     * The rail's foot: the account menu, and choices beside it
     * (`RailChoice`). It is drawn a second time at the end of the phone's
     * bar, and CSS shows the one that fits, so what it holds mounts twice.
     * Each part draws itself as what stands beside it: a row of the rail,
     * a place's icon in the phone's top bar, a place's cell in the tab bar.
     */
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
    /**
     * The conditions of the whole app that hold now: they stand at the top
     * of every screen until the app takes them away.
     */
    conditions?: readonly Condition[];
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
            foot={foot}
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
                <Conditions conditions={conditions ?? []} />
                <TopBarLead value={lead ?? null}>{children}</TopBarLead>
            </main>

            {!room.leads && phone}
        </div>
    );
}
