import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { Chip } from "./Chip";

it("takes itself away by a control named for what it takes", async () => {
    const removed = vi.fn();
    render(
        <Chip onRemove={removed} removeLabel="Remove the Atlas filter">
            Project: Atlas
        </Chip>,
    );
    await userEvent.click(
        screen.getByRole("button", { name: "Remove the Atlas filter" }),
    );
    expect(removed).toHaveBeenCalledOnce();
});

it("names its remove control with the words' own word, given none", () => {
    render(<Chip onRemove={() => undefined}>Project: Atlas</Chip>);
    expect(
        screen.getByRole("button", { name: ENGLISH.remove }),
    ).toBeInTheDocument();
});

it("offers no remove control where nothing removes it", () => {
    render(<Chip>Project: Atlas</Chip>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
