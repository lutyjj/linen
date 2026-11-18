import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { NumberField } from "./NumberField";

function Volume({
    start = -20,
    disabled,
    onCommit,
}: {
    start?: number;
    disabled?: boolean;
    onCommit?: (value: number | null) => void;
}) {
    const [value, setValue] = useState<number | null>(start);
    return (
        <NumberField
            label="Volume"
            hint="The level the output starts at."
            unit="dB"
            min={-60}
            max={0}
            disabled={disabled}
            value={value}
            onValueChange={setValue}
            onValueCommit={onCommit}
        />
    );
}

it("steps within its range from the keyboard and its buttons", async () => {
    const user = userEvent.setup();
    render(<Volume />);
    const volume = screen.getByRole("textbox", { name: "Volume" });
    expect(volume).toHaveAccessibleDescription(
        "dB The level the output starts at.",
    );

    await user.click(volume);
    await user.keyboard("{ArrowUp}");
    expect(volume).toHaveValue("-19");
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(volume).toHaveValue("-9");
    await user.keyboard("{End}");
    expect(volume).toHaveValue("0");
    await user.click(screen.getByRole("button", { name: ENGLISH.increase }));
    expect(volume).toHaveValue("0");
    await user.keyboard("{Home}");
    expect(volume).toHaveValue("-60");
    await user.click(screen.getByRole("button", { name: ENGLISH.decrease }));
    expect(volume).toHaveValue("-60");
});

it("at either end of its range disables only the step that cannot go further", async () => {
    const user = userEvent.setup();
    render(<Volume start={-60} />);
    const volume = screen.getByRole("textbox", { name: "Volume" });
    const frame = screen.getByRole("group");
    const down = screen.getByRole("button", { name: ENGLISH.decrease });
    const up = screen.getByRole("button", { name: ENGLISH.increase });
    expect(volume).toBeEnabled();
    expect(down).toBeDisabled();
    expect(up).toBeEnabled();
    // The frame's look keys on this, which Base UI sets for the field alone.
    expect(frame).not.toHaveAttribute("data-disabled");

    await user.click(volume);
    await user.keyboard("{End}");
    expect(down).toBeEnabled();
    expect(up).toBeDisabled();
    expect(frame).not.toHaveAttribute("data-disabled");
});

it("is drawn disabled, steps and all, only while it is disabled", () => {
    render(<Volume disabled />);
    expect(screen.getByRole("textbox", { name: "Volume" })).toBeDisabled();
    for (const step of screen.getAllByRole("button")) {
        expect(step).toBeDisabled();
    }
    expect(screen.getByRole("group")).toHaveAttribute("data-disabled");
});

it("hands on the value once it is settled", async () => {
    const user = userEvent.setup();
    const committed = vi.fn();
    render(<Volume onCommit={committed} />);
    const volume = screen.getByRole("textbox", { name: "Volume" });
    await user.clear(volume);
    await user.type(volume, "-35");
    expect(committed).not.toHaveBeenCalled();
    await user.tab();
    expect(committed).toHaveBeenLastCalledWith(-35);
});

it("describes its value by no unit that is nothing", () => {
    render(
        <NumberField
            label="Gain"
            value={3}
            onValueChange={() => undefined}
            unit={false}
        />,
    );
    expect(screen.getByRole("textbox", { name: "Gain" })).not.toHaveAttribute(
        "aria-describedby",
    );
});
