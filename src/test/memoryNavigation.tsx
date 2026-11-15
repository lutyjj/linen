import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Blocker, LinkProps, Navigation } from "../navigation/navigation";

/** A move that waits while `when` says so, and what it was waiting to do. */
interface Hold {
    when: (nextPathname: string) => boolean;
    hold: (to: string) => void;
}

/**
 * A navigation over an address kept in memory, holding moves as a router's
 * blocker does: what the tests run linen's components on, under any React.
 */
export function memoryNavigation(initial = "/") {
    let address = initial;
    const listeners = new Set<() => void>();
    const holds = new Set<Hold>();
    const pathOf = (to: string) => to.split(/[?#]/, 1)[0] ?? to;

    function go(to: string) {
        address = to;
        for (const listener of listeners) listener();
    }

    function move(to: string) {
        for (const hold of holds) {
            if (hold.when(pathOf(to))) {
                hold.hold(to);
                return;
            }
        }
        go(to);
    }

    function subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function Link({ href, onClick, ...props }: LinkProps) {
        return (
            <a
                {...props}
                href={href}
                onClick={(event) => {
                    onClick?.(event);
                    if (event.defaultPrevented) return;
                    event.preventDefault();
                    move(href);
                }}
            />
        );
    }

    function usePathname(): string {
        return useSyncExternalStore(subscribe, () => pathOf(address));
    }

    function useBlocker(when: (nextPathname: string) => boolean): Blocker {
        const [held, setHeld] = useState<string | null>(null);
        const latest = useRef(when);
        latest.current = when;
        useLayoutEffect(() => {
            const hold: Hold = {
                when: (next) => latest.current(next),
                hold: setHeld,
            };
            holds.add(hold);
            return () => {
                holds.delete(hold);
            };
        }, []);
        return {
            blocked: held !== null,
            proceed: () => {
                if (held === null) return;
                setHeld(null);
                go(held);
            },
            reset: () => setHeld(null),
        };
    }

    const navigation: Navigation = { Link, usePathname, useBlocker };
    return { navigation, address: () => address, usePathname };
}
