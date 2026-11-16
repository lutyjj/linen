import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Checkbox, SelectToggle } from "./Checkbox";

it("is named by its words, and a press on them ticks it", async () => {
    const ticked = vi.fn();
    render(
        <Checkbox checked={false} onCheckedChange={ticked}>
            Read only
        </Checkbox>,
    );
    expect(
        screen.getByRole("checkbox", { name: "Read only" }),
    ).not.toBeChecked();
    await userEvent.click(screen.getByText("Read only"));
    expect(ticked).toHaveBeenCalledTimes(1);
    expect(ticked).toHaveBeenCalledWith(true, expect.anything());
});

it("selects rows, mixed while some are, and asks for a range with Shift", async () => {
    const asked = vi.fn();
    function Selecting() {
        const [all, setAll] = useState(false);
        return (
            <SelectToggle
                label="Select every row"
                checked={all}
                indeterminate={!all}
                onCheckedChange={(checked, range) => {
                    asked(checked, range);
                    setAll(checked);
                }}
            />
        );
    }
    const user = userEvent.setup();
    render(<Selecting />);
    const toggle = screen.getByRole("checkbox", { name: "Select every row" });
    expect(toggle).toHaveAttribute("aria-checked", "mixed");
    await user.click(toggle);
    await user.keyboard("{Shift>}");
    await user.click(toggle);
    await user.keyboard("{/Shift}");
    expect(asked.mock.calls).toEqual([
        [true, false],
        [false, true],
    ]);
});
