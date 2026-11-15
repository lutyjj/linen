import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { expect, it } from "vitest";

import { MotionProvider } from "./MotionProvider";
import { SettlingItem, SettlingRows } from "./SettlingRows";

// StrictMode runs every effect twice, as a remount does.
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

/** Whether a row wears the arrival mark, which the stylesheet plays. */
const marked = (row: string) =>
    screen.getByText(row).hasAttribute("data-arrival");

/** The stylesheet's arrival animation reaching its end on a row. */
function markEnds(row: string) {
    act(() => {
        fireEvent.animationEnd(screen.getByText(row), {
            animationName: "linen-arrival",
        });
    });
}

it("marks no row the list starts with, and every row after, until its mark ends", () => {
    const list = render(<List rows={["Atlas"]} />);
    expect(marked("Atlas")).toBe(false);

    list.rerender(<List rows={["Atlas", "Harbor"]} />);
    expect(marked("Harbor")).toBe(true);
    expect(marked("Atlas")).toBe(false);

    markEnds("Harbor");
    expect(marked("Harbor")).toBe(false);
    // Shown again, the row does not wear its mark a second time.
    list.rerender(<List rows={["Harbor", "Atlas"]} />);
    expect(marked("Harbor")).toBe(false);
});

it("keeps the mark through an animation of something inside the row", () => {
    const list = render(<List rows={[]} />);
    list.rerender(<List rows={["Atlas"]} />);
    act(() => {
        fireEvent.animationEnd(screen.getByText("Atlas"), {
            animationName: "linen-turn",
        });
    });
    expect(marked("Atlas")).toBe(true);
});

it("starts a list given its scope once its rows loaded with those rows", () => {
    const list = render(<List loaded={false} rows={[]} />);
    list.rerender(<List rows={["Atlas", "Harbor"]} />);
    expect(marked("Atlas")).toBe(false);
    expect(marked("Harbor")).toBe(false);

    list.rerender(<List rows={["Atlas", "Harbor", "Orchard"]} />);
    expect(marked("Orchard")).toBe(true);
});

it("marks the first row of a list that loaded empty", () => {
    const list = render(<List rows={[]} />);
    list.rerender(<List rows={["Atlas"]} />);
    expect(marked("Atlas")).toBe(true);
});
