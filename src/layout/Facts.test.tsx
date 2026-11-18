import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { Fact, Facts } from "./Facts";

it("names each value, and puts a value on the clipboard whole", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(
        <Facts>
            <Fact name="Version">2.4.1</Fact>
            <Fact
                name="Address"
                mono
                copy={{ value: "192.0.2.10", label: "Address" }}
            >
                192.0.2.10
            </Fact>
        </Facts>,
    );
    const names = screen.getAllByRole("term").map((term) => term.textContent);
    const values = screen
        .getAllByRole("definition")
        .map((value) => value.textContent);
    expect(names).toEqual(["Version", "Address"]);
    expect(values).toEqual(["2.4.1", "192.0.2.10"]);

    await user.click(
        screen.getByRole("button", { name: `${ENGLISH.copy}: Address` }),
    );
    expect(writeText).toHaveBeenCalledWith("192.0.2.10");
});

it("sets one fact apart by the caller's class, on the row that holds its name and value", () => {
    render(
        <Facts>
            <Fact name="Version">2.4.1</Fact>
            <Fact name="Address" className="pinned">
                192.0.2.10
            </Fact>
        </Facts>,
    );
    const [version, address] = screen
        .getAllByRole("term")
        .map((term) => term.parentElement);
    expect(address).toHaveClass("pinned");
    expect(address).toContainElement(screen.getByText("192.0.2.10"));
    expect(version).not.toHaveClass("pinned");
});
