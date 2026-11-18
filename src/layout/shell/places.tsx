import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { classes } from "../../foundation/classes";
import { useNavigation } from "../../navigation/navigation";

/** A place the navigation leads to. */
export interface Place {
    /** A path from the root, such as `/settings/people`. */
    href: string;
    label: string;
    icon: LucideIcon;
    /** Where the link is active only on its own address, not beneath it. */
    exact?: boolean;
    /** A count waiting for a hand, worn after the words or as a dot. */
    badge?: string;
}

/** The app's first screen, and the app's name, which names the way there. */
export interface Home {
    /** A path from the root, such as `/`. */
    href: string;
    label: string;
}

/**
 * The wordmark or the mark, leading to the app's first screen from wherever
 * the person is, as a product's name does on every site.
 */
export function HomeLink({
    home,
    className,
    children,
}: {
    home: Home;
    className?: string;
    children: ReactNode;
}) {
    const { Link } = useNavigation();
    return (
        <Link
            href={home.href}
            aria-label={home.label}
            className={classes(
                "-m-1 flex items-center rounded-button p-1",
                className,
            )}
        >
            {children}
        </Link>
    );
}

/**
 * A place in navigation, in the rail, the phone's top bar or a screen's
 * sections: at rest, under a pointer and current. Its icon stands in the
 * row's inset on both sides. The current place's fill is the caller's, a
 * mark that slides between places or the row's own.
 */
export function placeClass(current: boolean): string {
    return classes(
        "flex h-(--height-control) items-center gap-2 rounded-button px-2 text-sm",
        current
            ? "font-medium text-accent"
            : "text-text-secondary pressable:hover:bg-border pressable:hover:text-text",
    );
}

export interface PlaceList {
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
