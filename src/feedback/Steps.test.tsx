import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { ENGLISH } from "../foundation/words";
import { Steps } from "./Steps";

const STEPS = [
    { id: "network", label: "Network" },
    { id: "account", label: "Account" },
    { id: "check", label: "Check" },
];

it("marks the step under way, and says the ones before it are done", () => {
    render(<Steps label="Setup" steps={STEPS} current="account" />);
    const steps = within(screen.getByRole("list", { name: "Setup" }));
    const items = steps.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(`Network, ${ENGLISH.done}`);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[1]).not.toHaveTextContent(ENGLISH.done);
    expect(items[2]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveTextContent(ENGLISH.done);
});

it("opens at a later step, as a task resumed does", () => {
    render(<Steps label="Setup" steps={STEPS} current="check" />);
    const items = screen.getAllByRole("listitem");
    expect(
        items.filter((item) => item.textContent?.includes(ENGLISH.done)),
    ).toHaveLength(2);
    expect(items[2]).toHaveAttribute("aria-current", "step");
});
