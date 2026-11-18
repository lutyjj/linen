import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, useState } from "react";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { CellNumber, NumberField } from "./NumberField";

function Volume(
    props: Omit<
        ComponentProps<typeof NumberField>,
        "label" | "value" | "onValueChange"
    > & {
        start?: number;
    },
) {
    const { start = -20, ...rest } = props;
    const [value, setValue] = useState<number | null>(start);
    return (
        <NumberField
            label="Volume"
            hint="The level the output starts at."
            unit="dB"
            min={-60}
            max={0}
            {...rest}
            value={value}
            onValueChange={setValue}
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

it("takes its large step with Shift held", async () => {
    const user = userEvent.setup();
    render(<Volume largeStep={6} />);
    const volume = screen.getByRole("textbox", { name: "Volume" });
    await user.click(volume);
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(volume).toHaveValue("-26");
    await user.keyboard("{Shift>}{ArrowUp}{ArrowUp}{/Shift}");
    expect(volume).toHaveValue("-14");
});

it("takes ten of its own steps with Shift held, unless it says otherwise", async () => {
    const user = userEvent.setup();
    function Stepped({ step }: { step: number }) {
        const [value, setValue] = useState<number | null>(step * 20);
        return (
            <NumberField
                label={`In steps of ${step}`}
                step={step}
                value={value}
                onValueChange={setValue}
            />
        );
    }
    render(
        <>
            <Stepped step={500} />
            <Stepped step={0.05} />
        </>,
    );
    const coarse = screen.getByRole("textbox", { name: "In steps of 500" });
    await user.click(coarse);
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(coarse).toHaveValue("15,000");
    const fine = screen.getByRole("textbox", { name: "In steps of 0.05" });
    await user.click(fine);
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(fine).toHaveValue("0.5");
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
    render(<Volume onValueCommitted={committed} />);
    const volume = screen.getByRole("textbox", { name: "Volume" });
    await user.clear(volume);
    await user.type(volume, "-35");
    expect(committed).not.toHaveBeenCalled();
    await user.tab();
    expect(committed).toHaveBeenLastCalledWith(-35);
});

it("stands bare where its name is in sight, named by its own words", () => {
    render(
        <CellNumber
            aria-label="Copies kept"
            unit="copies"
            value={7}
            onValueChange={() => undefined}
            min={1}
            max={30}
        />,
    );
    expect(
        screen.getByRole("textbox", { name: "Copies kept" }),
    ).toHaveAccessibleDescription("copies");
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
