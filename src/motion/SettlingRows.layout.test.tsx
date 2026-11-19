import { act, render } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";

import { MotionProvider } from "./MotionProvider";
import { SettlingItem, SettlingRows } from "./SettlingRows";

// Where jsdom lays nothing out, a row stands as far down as it is far along
// its parent, which is what Motion measures to see a row move.
const ROW = 20;
beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function (this: Element) {
            const along = [...(this.parentElement?.children ?? [])].indexOf(
                this,
            );
            return new DOMRect(0, along * ROW, 100, ROW);
        },
    );
});
afterEach(() => vi.restoreAllMocks());

// Every style a row has worn, as Motion writes a transform to carry a row
// from where it stood to its place.
let worn = new Map<Element, string[]>();
const watch = new MutationObserver((records) => {
    for (const { target, oldValue } of records) {
        if (!(target instanceof Element)) continue;
        const styles = worn.get(target) ?? [];
        styles.push(oldValue ?? "", target.getAttribute("style") ?? "");
        worn.set(target, styles);
    }
});
beforeEach(() => {
    worn = new Map();
    watch.observe(document.body, {
        subtree: true,
        attributeFilter: ["style"],
        attributeOldValue: true,
    });
});
afterEach(() => watch.disconnect());

/** Whether a row was drawn a row's height from its place and travelled. */
const travelled = (list: string, row: string) =>
    [...worn].some(
        ([element, styles]) =>
            element.getAttribute("data-list") === list &&
            element.textContent === row &&
            styles.some((style) => style.includes(`0px, ${ROW}px`)),
    );

// Motion's layout features, which its provider loads once the page has
// drawn: imported here first, so the provider has them within a turn.
beforeAll(() => import("./features"));
const settle = () =>
    act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
    });

/**
 * The same rows twice: a list that tells its rows apart by their keys, and
 * one given the revision of the whole list it shows a window of.
 */
function Lists({
    rows,
    revision,
}: {
    rows: readonly string[];
    revision: string;
}) {
    return (
        <MotionProvider>
            {(["keys", "revision"] as const).map((list) => (
                <div key={list}>
                    <SettlingRows
                        scope="tasks"
                        revision={list === "revision" ? revision : undefined}
                    >
                        {rows.map((row) => (
                            <SettlingItem key={row} data-list={list}>
                                {row}
                            </SettlingItem>
                        ))}
                    </SettlingRows>
                </div>
            ))}
        </MotionProvider>
    );
}

it("closes the rows after one that left up from where they stood", async () => {
    const lists = render(
        <Lists rows={["Atlas", "Harbor", "Orchard"]} revision="all" />,
    );
    await settle();

    lists.rerender(<Lists rows={["Harbor", "Orchard"]} revision="fewer" />);
    await settle();
    expect(travelled("keys", "Orchard")).toBe(true);
    expect(travelled("revision", "Orchard")).toBe(true);
});

it("moves no row of a window over a long list while its revision holds", async () => {
    const lists = render(
        <Lists rows={["Atlas", "Harbor", "Orchard"]} revision="all" />,
    );
    await settle();

    // The window moves on: its rows stand a place higher. Told apart by
    // their keys, the list takes that for a change and the rows travel; the
    // revision says that the list is what it was.
    lists.rerender(
        <Lists rows={["Harbor", "Orchard", "Lantern"]} revision="all" />,
    );
    await settle();
    expect(travelled("keys", "Orchard")).toBe(true);
    expect(travelled("revision", "Orchard")).toBe(false);
});
