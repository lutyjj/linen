import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

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
