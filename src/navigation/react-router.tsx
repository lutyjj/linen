import {
    Link as RouterLink,
    useBlocker as useRouterBlocker,
    useLocation,
} from "react-router";

import type { Blocker, LinkProps, Navigation } from "./navigation";

function Link({ href, ...props }: LinkProps) {
    return <RouterLink to={href} {...props} />;
}

function usePathname(): string {
    return useLocation().pathname;
}

function useBlocker(when: (nextPathname: string) => boolean): Blocker {
    const blocker = useRouterBlocker(({ nextLocation }) =>
        when(nextLocation.pathname),
    );
    return {
        blocked: blocker.state === "blocked",
        proceed: () => blocker.proceed?.(),
        reset: () => blocker.reset?.(),
    };
}

/**
 * React Router as linen's navigation: `<LinenProvider
 * navigation={reactRouter}>`, above or below the router, as long as linen's
 * components stand inside it. Its links and the current place work under any
 * router; holding a move for unsaved work uses `useBlocker`, which needs a
 * data router (`createBrowserRouter`).
 */
export const reactRouter: Navigation = { Link, usePathname, useBlocker };
