import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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
    children,
}: {
    home: Home;
    children: ReactNode;
}) {
    const { Link } = useNavigation();
    return (
        <Link
            href={home.href}
            aria-label={home.label}
            className="-m-1 flex shrink-0 items-center rounded-button p-1"
        >
            {children}
        </Link>
    );
}

/** A cell of the tab bar, a place's or the foot's: its icon over its name. */
export const TAB_CELL_CLASS =
    "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-3xs";

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
