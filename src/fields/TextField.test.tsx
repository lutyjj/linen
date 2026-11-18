import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { markup } from "../test/markup";
import { CellInput, CellText } from "./TextField";

describe("text corrected in place", () => {
    function Harness({
        onCommit,
    }: {
        onCommit: (value: string) => Promise<boolean>;
    }) {
        const [value, setValue] = useState("Atlas");
        return (
            <CellText
                label="Name"
                value={value}
                onCommit={async (next) => {
                    const kept = await onCommit(next);
                    if (kept) setValue(next);
                    return kept;
                }}
            />
        );
    }

    it("writes what Enter leaves", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        render(<Harness onCommit={onCommit} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Enter}");
        expect(onCommit).toHaveBeenCalledWith("Harbor");
        expect(box).toHaveValue("Harbor");
    });

    it("puts the held value back when the write is refused", async () => {
        render(<Harness onCommit={() => Promise.resolve(false)} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Enter}");
        expect(await screen.findByDisplayValue("Atlas")).toBe(box);
    });

    it("puts the held value back on Escape and writes nothing", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        render(<Harness onCommit={onCommit} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Escape}");
        expect(box).toHaveValue("Atlas");
        await userEvent.tab();
        expect(onCommit).not.toHaveBeenCalled();
    });
});

it("draws a cell whose unit is nothing as a cell without one", () => {
    const { container, rerender } = render(<CellInput aria-label="Limit" />);
    const cell = markup(container);
    rerender(<CellInput aria-label="Limit" unit="" />);
    expect(markup(container)).toBe(cell);
});
