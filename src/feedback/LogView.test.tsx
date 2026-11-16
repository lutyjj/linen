import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { LogView } from "./LogView";

afterEach(() => vi.restoreAllMocks());

/** jsdom lays nothing out: the box is given a height and a scroll here. */
function measured(box: HTMLElement, scrollHeight: number) {
    Object.defineProperty(box, "clientHeight", {
        configurable: true,
        value: 100,
    });
    Object.defineProperty(box, "scrollHeight", {
        configurable: true,
        value: scrollHeight,
    });
}

it("follows new lines at its end, and stays where a reader scrolled", async () => {
    const view = render(<LogView label="Service log" text="one" />);
    const box = screen
        .getByRole("region", { name: "Service log" })
        .querySelector("pre") as HTMLElement;
    measured(box, 500);
    view.rerender(<LogView label="Service log" text={"one\ntwo"} />);
    expect(box.scrollTop).toBe(500);

    box.scrollTop = 100;
    fireEvent.scroll(box);
    view.rerender(<LogView label="Service log" text={"one\ntwo\nthree"} />);
    expect(box.scrollTop).toBe(100);

    await userEvent.click(
        screen.getByRole("button", { name: ENGLISH.latestLines }),
    );
    expect(box.scrollTop).toBe(500);
    expect(
        screen.queryByRole("button", { name: ENGLISH.latestLines }),
    ).toBeNull();
});

it("saves the whole text as the file it names", async () => {
    const made = vi.fn((blob: Blob) => {
        void blob;
        return "blob:log";
    });
    URL.createObjectURL = made;
    URL.revokeObjectURL = vi.fn();
    const clicked = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => undefined);
    render(<LogView label="Service log" text="ready" filename="service.log" />);
    await userEvent.click(
        screen.getByRole("button", {
            name: `${ENGLISH.download}: service.log`,
        }),
    );
    expect(clicked).toHaveBeenCalledTimes(1);
    const blob = made.mock.calls[0]?.[0];
    expect(await blob?.text()).toBe("ready");
});
