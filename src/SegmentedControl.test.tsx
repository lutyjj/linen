import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
] as const;

function harness(value: "grid" | "list" | undefined) {
    const onChange = vi.fn();
    render(
        <SegmentedControl
            label="Layout"
            value={value}
            options={OPTIONS}
            onChange={onChange}
        />,
    );
    return onChange;
}

describe("one choice from a small fixed set", () => {
    it("answers with the option pressed", async () => {
        const onChange = harness(undefined);
        await userEvent.click(screen.getByRole("radio", { name: "List" }));
        expect(onChange).toHaveBeenCalledWith("list");
    });

    it("marks nothing while nothing is chosen", () => {
        harness(undefined);
        for (const option of screen.getAllByRole("radio")) {
            expect(option).toHaveAttribute("aria-checked", "false");
        }
    });

    it("says nothing when the option already chosen is pressed again", async () => {
        const onChange = harness("grid");
        await userEvent.click(screen.getByRole("radio", { name: "Grid" }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("is one stop on the Tab key, and the arrow keys move the choice", async () => {
        const onChange = harness("grid");
        await userEvent.tab();
        expect(screen.getByRole("radio", { name: "Grid" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        expect(onChange).toHaveBeenCalledWith("list");
    });
});
