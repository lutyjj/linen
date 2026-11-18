import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { markup } from "../test/markup";
import { CellInput, CellText } from "./TextField";

describe("text corrected in place", () => {
    function Harness({
        onCommit,
        ...props
    }: {
        onCommit: (value: string) => Promise<boolean>;
    } & Omit<ComponentProps<typeof CellText>, "label" | "value" | "onCommit">) {
        const [value, setValue] = useState("Atlas");
        return (
            <CellText
                {...props}
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

    it("puts the held value back when the write fails", async () => {
        render(
            <Harness onCommit={() => Promise.reject(new Error("offline"))} />,
        );
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Enter}");
        expect(await screen.findByDisplayValue("Atlas")).toBe(box);
    });

    it("writes an emptied box only where emptying is an answer", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        const { unmount } = render(<Harness onCommit={onCommit} />);
        await userEvent.clear(screen.getByRole("textbox", { name: "Name" }));
        await userEvent.tab();
        expect(onCommit).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
            "Atlas",
        );
        unmount();

        render(<Harness onCommit={onCommit} clearable />);
        await userEvent.clear(screen.getByRole("textbox", { name: "Name" }));
        await userEvent.tab();
        expect(onCommit).toHaveBeenCalledWith("");
    });

    it("opens a draft with the cursor in it, and writes it when left", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        render(<Harness onCommit={onCommit} draft="Atlas north" />);
        const box = screen.getByRole("textbox", { name: "Name" });
        expect(box).toHaveFocus();
        expect(box).toHaveValue("Atlas north");
        await userEvent.tab();
        expect(onCommit).toHaveBeenCalledWith("Atlas north");
    });

    it("says a draft left unwritten is spent", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        const onDiscard = vi.fn();
        render(
            <Harness
                onCommit={onCommit}
                onDiscard={onDiscard}
                draft="Atlas north"
            />,
        );
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.type(box, "{Escape}");
        expect(box).toHaveValue("Atlas");
        await userEvent.tab();
        expect(onCommit).not.toHaveBeenCalled();
        expect(onDiscard).toHaveBeenCalledOnce();
    });
});

it("describes a value by its unit, and takes a unit only with a held value", () => {
    render(
        <CellInput
            aria-label="Retention"
            unit="days"
            value="30"
            onChange={() => undefined}
        />,
    );
    expect(
        screen.getByRole("textbox", { name: "Retention" }),
    ).toHaveAccessibleDescription("days");
    // A value only the input holds can change unheard, as a form's reset
    // changes it, and leave its unit where the old value ended.
    // @ts-expect-error A unit needs a value the app holds.
    void (<CellInput aria-label="Timeout" unit="sec" defaultValue="120" />);
});

it("draws a cell whose unit is nothing as a cell without one", () => {
    const { container, rerender } = render(<CellInput aria-label="Limit" />);
    const cell = markup(container);
    rerender(<CellInput aria-label="Limit" unit="" />);
    expect(markup(container)).toBe(cell);
});
