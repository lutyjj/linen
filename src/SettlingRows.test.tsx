import { act, render, screen } from "@testing-library/react";
import { MotionGlobalConfig, processFrame } from "motion/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it } from "vitest";

import { MotionProvider, seconds } from "./motion";
import { SettlingItem, SettlingRows } from "./SettlingRows";

// The mark is a tint a row holds for its first moments, so animations run,
// on Motion's manual clock, which the test moves frame by frame.
let now = 0;
beforeEach(() => {
    MotionGlobalConfig.skipAnimations = false;
    MotionGlobalConfig.useManualTiming = true;
});
afterEach(() => {
    MotionGlobalConfig.useManualTiming = false;
    MotionGlobalConfig.skipAnimations = true;
});

// StrictMode runs every effect twice, as a remount does, which replays a
// row's animation.
function List({
    loaded = true,
    rows,
}: {
    /** Whether the rows have come, which is when the list has its scope. */
    loaded?: boolean;
    rows: readonly string[];
}) {
    return (
        <StrictMode>
            <MotionProvider>
                <SettlingRows
                    scope={loaded ? "tokens" : undefined}
                    marksArrivals
                >
                    {rows.map((row) => (
                        <SettlingItem key={row}>{row}</SettlingItem>
                    ))}
                </SettlingRows>
            </MotionProvider>
        </StrictMode>
    );
}

/** Moves the clock on by some milliseconds, frame by frame. */
function wait(ms: number) {
    act(() => {
        for (const end = now + ms; now < end;) processFrame((now += 1000 / 60));
    });
}

/** How strongly a row wears the arrival mark now. */
const mark = (row: string) =>
    Number(screen.getByText(row).style.getPropertyValue("--arrival"));

it("marks no row the list starts with, and every row after, for a while", () => {
    const list = render(<List rows={["Atlas"]} />);
    wait(100);
    expect(mark("Atlas")).toBe(0);

    list.rerender(<List rows={["Atlas", "Harbor"]} />);
    wait(100);
    expect(mark("Harbor")).toBe(1);
    expect(mark("Atlas")).toBe(0);

    wait(seconds("mark") * 1000);
    expect(mark("Harbor")).toBe(0);
});

it("starts a list given its scope once its rows loaded with those rows", () => {
    const list = render(<List loaded={false} rows={[]} />);
    list.rerender(<List rows={["Atlas", "Harbor"]} />);
    wait(100);
    expect(mark("Atlas")).toBe(0);
    expect(mark("Harbor")).toBe(0);

    list.rerender(<List rows={["Atlas", "Harbor", "Orchard"]} />);
    wait(100);
    expect(mark("Orchard")).toBe(1);
});

it("marks the first row of a list that loaded empty", () => {
    const list = render(<List rows={[]} />);
    list.rerender(<List rows={["Atlas"]} />);
    wait(100);
    expect(mark("Atlas")).toBe(1);
});
