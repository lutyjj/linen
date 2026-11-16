import { h, render } from "preact";
import { act } from "preact/test-utils";
import { expect, it } from "vitest";

import { useSyncExternalStoreWithSelector } from "./use-sync-external-store";

const store = {
    snapshot: { count: 2 },
    subscribe: () => () => undefined,
    get: () => store.snapshot,
};

it("makes a new selection when the selector changes and the snapshot does not", async () => {
    const seen: number[] = [];
    function Reader({ by }: { by: number }) {
        const selector = (snapshot: { count: number }) => snapshot.count * by;
        seen.push(
            useSyncExternalStoreWithSelector(
                store.subscribe,
                store.get,
                undefined,
                selector,
            ),
        );
        return null;
    }
    const root = document.createElement("div");
    await act(() => render(h(Reader, { by: 1 }), root));
    await act(() => render(h(Reader, { by: 10 }), root));
    expect(seen.at(-1)).toBe(20);
});
