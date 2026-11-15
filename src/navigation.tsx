import { m } from "motion/react";
import {
    type AnchorHTMLAttributes,
    type ComponentType,
    createContext,
    type Ref,
    use,
    useSyncExternalStore,
} from "react";

/** What a link is handed: where it leads, and everything an anchor wears. */
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** A path from the root, such as `/settings/people`. */
    href: string;
    ref?: Ref<HTMLAnchorElement>;
};

/** A move away that waits for the person to decide. */
export interface Blocker {
    /** Whether a move is waiting. */
    blocked: boolean;
    /** Lets the waiting move go on. */
    proceed: () => void;
    /** Calls the waiting move off. */
    reset: () => void;
}

/**
 * How the app moves between its pages, which linen's links follow: `Link`
 * renders an anchor that moves the way the app's router does, `usePathname`
 * reads the current address and follows it, and `useBlocker` holds a move
 * within the app while its `when` says so. Every member is a stable function
 * or component, so the adapter is defined once, outside any component.
 *
 * `LinenProvider` takes one as `navigation`; without one, links are plain
 * anchors that load the page they lead to. `linen/react-router` exports the
 * adapter for React Router.
 */
export interface Navigation {
    Link: ComponentType<LinkProps>;
    usePathname: () => string;
    /** Without it, only the browser asks before the tab closes or reloads. */
    useBlocker?: (when: (nextPathname: string) => boolean) => Blocker;
}

function Anchor(props: LinkProps) {
    return <a {...props} />;
}

function subscribePath(listener: () => void): () => void {
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
}

function usePathname(): string {
    return useSyncExternalStore(subscribePath, () => window.location.pathname);
}

const NOTHING_WAITS: Blocker = {
    blocked: false,
    proceed: () => undefined,
    reset: () => undefined,
};

function useNoBlocker(): Blocker {
    return NOTHING_WAITS;
}

/** The page's own links, each a load of the page it leads to. */
const DOCUMENT: Required<Navigation> = {
    Link: Anchor,
    usePathname,
    useBlocker: useNoBlocker,
};

export const NavigationContext = createContext<Required<Navigation>>(DOCUMENT);

/** An app's adapter, with nothing held where it holds nothing. */
export function navigationOf(
    navigation: Navigation | undefined,
): Required<Navigation> {
    if (navigation === undefined) return DOCUMENT;
    return {
        ...navigation,
        useBlocker: navigation.useBlocker ?? useNoBlocker,
    };
}

export function useNavigation(): Required<Navigation> {
    return use(NavigationContext);
}

/**
 * Whether `href`, a path from the root, names the current place: the address
 * itself, or, unless `exact`, any address beneath it. Letters match in either
 * case, as routers match their routes. The root is only ever its own address,
 * or it would be the current place everywhere.
 */
export function isCurrent(
    pathname: string,
    href: string,
    exact = false,
): boolean {
    const path = (href.split(/[?#]/, 1)[0] ?? href).toLowerCase();
    const place = path.length > 1 ? path.replace(/\/+$/, "") : path;
    const here = pathname.toLowerCase();
    if (here === place) return true;
    return !exact && place !== "/" && here.startsWith(`${place}/`);
}

/** Whether `href` names the current place, followed as the address changes. */
export function useCurrent(href: string, exact = false): boolean {
    return isCurrent(useNavigation().usePathname(), href, exact);
}

function motionOf(Link: ComponentType<LinkProps>) {
    return m.create(Link);
}

const motionLinks = new WeakMap<
    ComponentType<LinkProps>,
    ReturnType<typeof motionOf>
>();

/** The app's link as a Motion component, made once per link component. */
export function useMotionLink(): ReturnType<typeof motionOf> {
    const { Link } = useNavigation();
    let motionLink = motionLinks.get(Link);
    if (motionLink === undefined) {
        motionLink = motionOf(Link);
        motionLinks.set(Link, motionLink);
    }
    return motionLink;
}
