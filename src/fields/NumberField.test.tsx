import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { NumberField } from "./NumberField";

function Volume({ onCommit }: { onCommit?: (value: number | null) => void }) {
    const [value, setValue] = useState<number | null>(-20);
    return (
        <NumberField
            label="Volume"
            hint="The level the output starts at."
            unit="dB"
            min={-60}
            max={0}
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
        "The level the output starts at. dB",
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
