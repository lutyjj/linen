import { Field } from "@base-ui/react/field";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { markup } from "../test/markup";
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

it("keeps each box named by its own words inside a field", () => {
    render(
        <Field.Root>
            <Field.Label nativeLabel={false} render={<div />}>
                Alerts
            </Field.Label>
            <Checkbox checked={false} onCheckedChange={() => undefined}>
                By email
            </Checkbox>
            <Checkbox checked onCheckedChange={() => undefined}>
                By text
            </Checkbox>
        </Field.Root>,
    );
    expect(
        screen.getByRole("checkbox", { name: "By email" }),
    ).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "By text" })).toBeChecked();
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

it("draws a box whose words are nothing as the box alone", () => {
    const box = (words?: false) => (
        <Checkbox
            aria-label="Archived"
            checked={false}
            onCheckedChange={() => undefined}
            className="ml-2"
        >
            {words}
        </Checkbox>
    );
    const { container, rerender } = render(box());
    const alone = markup(container);
    rerender(box(false));
    expect(markup(container)).toBe(alone);
});
