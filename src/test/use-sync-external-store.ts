import { useCallback, useRef, useSyncExternalStore } from "preact/compat";

/*
 * use-sync-external-store, which Base UI imports and which ships only as
 * CommonJS: Vitest loads it natively, so its own require of React reaches
 * React itself whatever the aliases say. The Preact project resolves it to
 * this module, on Preact's own hook. An app's bundler converts the package,
 * so an app needs none of this.
 */
export { useSyncExternalStore };

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe: (onChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    _getServerSnapshot: undefined | null | (() => Snapshot),
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
    const last = useRef<{ snapshot: Snapshot; selection: Selection } | null>(
        null,
    );
    const select = useCallback(() => {
        const snapshot = getSnapshot();
        const held = last.current;
        if (held !== null && Object.is(held.snapshot, snapshot)) {
            return held.selection;
        }
        const selection = selector(snapshot);
        if (held !== null && isEqual?.(held.selection, selection) === true) {
            last.current = { snapshot, selection: held.selection };
            return held.selection;
        }
        last.current = { snapshot, selection };
        return selection;
    }, [getSnapshot, selector, isEqual]);
    return useSyncExternalStore(subscribe, select);
}
