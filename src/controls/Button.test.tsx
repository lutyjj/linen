import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Button } from "./Button";

it("takes no second press while what it started is under way", async () => {
    const pressed = vi.fn();
    const submitted = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { rerender } = render(
        <form onSubmit={(event) => submitted(event.nativeEvent)}>
            <Button type="submit" busy onClick={pressed}>
                Save
            </Button>
        </form>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toHaveAttribute("aria-busy", "true");
    expect(save).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(save);
    expect(pressed).not.toHaveBeenCalled();
    expect(submitted).not.toHaveBeenCalled();
    // It waits where the person left it.
    expect(save).toHaveFocus();

    rerender(
        <form onSubmit={(event) => submitted(event.nativeEvent)}>
            <Button type="submit" onClick={pressed}>
                Save
            </Button>
        </form>,
    );
    await userEvent.click(save);
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveAttribute("aria-busy");
});
