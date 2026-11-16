import { useCallback, useRef, useSyncExternalStore } from "preact/compat";

/*
 * use-sync-external-store, which Base UI imports and which ships only as
 * CommonJS: Vitest loads CommonJS in Node, past every alias, so its own
 * require of React reaches React itself. The Preact project resolves it to
 * this module, on Preact's own hook. An app's bundler converts the package,
 * so an app needs none of this; it goes once Base UI imports React's own
 * hook, which every React it supports has.
 */
export { useSyncExternalStore };

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe: (onChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    _getServerSnapshot: undefined | null | (() => Snapshot),
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
    // The last selection, and what it was made from: a new selector or a new
    // snapshot makes a new one.
    const last = useRef<{
        snapshot: Snapshot;
        selector: (snapshot: Snapshot) => Selection;
        selection: Selection;
    } | null>(null);
    const select = useCallback(() => {
        const snapshot = getSnapshot();
        const held = last.current;
        if (
            held !== null &&
            held.selector === selector &&
            Object.is(held.snapshot, snapshot)
        ) {
            return held.selection;
        }
        const selection = selector(snapshot);
        const kept =
            held !== null && isEqual?.(held.selection, selection) === true
                ? held.selection
                : selection;
        last.current = { snapshot, selector, selection: kept };
        return kept;
    }, [getSnapshot, selector, isEqual]);
    return useSyncExternalStore(subscribe, select);
}
