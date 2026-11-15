import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

describe("a search box", () => {
    afterEach(() => vi.useRealTimers());

    function setup(value = "") {
        vi.useFakeTimers({
            toFake: ["setTimeout", "clearTimeout"],
            shouldAdvanceTime: true,
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onChange = vi.fn();
        const onSubmit = vi.fn();
        const view = render(
            <SearchField
                label="Search"
                value={value}
                onChange={onChange}
                onSubmit={onSubmit}
            />,
        );
        return {
            user,
            onChange,
            onSubmit,
            view,
            box: screen.getByRole("textbox", { name: "Search" }),
        };
    }

    it("hands on what is typed once typing pauses, once", async () => {
        const { user, onChange, box } = setup();
        await user.type(box, "atl");
        expect(onChange).not.toHaveBeenCalled();
        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith("atl");
    });

    it("keeps what is typed when its own value comes back", async () => {
        const { user, box, view } = setup();
        await user.type(box, "a");
        act(() => {
            vi.advanceTimersByTime(250);
        });
        await user.type(box, "tl");
        view.rerender(
            <SearchField label="Search" value="a" onChange={() => undefined} />,
        );
        expect(box).toHaveValue("atl");
    });

    it("shows a value cleared elsewhere", async () => {
        const { user, box, view } = setup();
        await user.type(box, "atl");
        act(() => {
            vi.advanceTimersByTime(250);
        });
        // The owner holds what was handed on, then clears it.
        view.rerender(
            <SearchField
                label="Search"
                value="atl"
                onChange={() => undefined}
            />,
        );
        view.rerender(
            <SearchField label="Search" value="" onChange={() => undefined} />,
        );
        expect(box).toHaveValue("");
    });

    it("hands on at once when Enter is pressed", async () => {
        const { user, onChange, onSubmit, box } = setup();
        await user.type(box, "atl{Enter}");
        expect(onChange).toHaveBeenCalledWith("atl");
        expect(onSubmit).toHaveBeenCalledWith("atl");
    });
});
