import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { RefreshMotion } from "./motion";

const mark = () => screen.getByText("↻");
const turning = () =>
    mark().parentElement?.classList.contains("refresh-turning");

/** A turn of the mark ends, or of something else under it. */
function iterate(
    target: Element = mark().parentElement as Element,
    name = "linen-turn",
) {
    act(() => {
        fireEvent.animationIteration(target, { animationName: name });
    });
}

it("turns while a refresh is pending and finishes its turn once it ends", () => {
    const view = render(
        <RefreshMotion active>
            <span>↻</span>
        </RefreshMotion>,
    );
    expect(turning()).toBe(true);

    view.rerender(
        <RefreshMotion active={false}>
            <span>↻</span>
        </RefreshMotion>,
    );
    // The turn under way goes on to its end, so the mark rests upright.
    expect(turning()).toBe(true);
    iterate();
    expect(turning()).toBe(false);
});

it("keeps turning through a turn's end while the refresh is still pending", () => {
    render(
        <RefreshMotion active>
            <span>↻</span>
        </RefreshMotion>,
    );
    iterate();
    expect(turning()).toBe(true);
});

it("finishes its own turn, not that of something it holds", () => {
    const view = render(
        <RefreshMotion active>
            <span>↻</span>
        </RefreshMotion>,
    );
    view.rerender(
        <RefreshMotion active={false}>
            <span>↻</span>
        </RefreshMotion>,
    );
    iterate(mark(), "pulse");
    expect(turning()).toBe(true);
});
