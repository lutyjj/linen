import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CellSelect, CellText, SearchField } from "./Form";

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

describe("text corrected in place", () => {
    function Harness({
        onCommit,
    }: {
        onCommit: (value: string) => Promise<boolean>;
    }) {
        const [value, setValue] = useState("Atlas");
        return (
            <CellText
                label="Name"
                value={value}
                onCommit={async (next) => {
                    const kept = await onCommit(next);
                    if (kept) setValue(next);
                    return kept;
                }}
            />
        );
    }

    it("writes what Enter leaves", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        render(<Harness onCommit={onCommit} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Enter}");
        expect(onCommit).toHaveBeenCalledWith("Harbor");
        expect(box).toHaveValue("Harbor");
    });

    it("puts the held value back when the write is refused", async () => {
        render(<Harness onCommit={() => Promise.resolve(false)} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Enter}");
        expect(await screen.findByDisplayValue("Atlas")).toBe(box);
    });

    it("puts the held value back on Escape and writes nothing", async () => {
        const onCommit = vi.fn(() => Promise.resolve(true));
        render(<Harness onCommit={onCommit} />);
        const box = screen.getByRole("textbox", { name: "Name" });
        await userEvent.clear(box);
        await userEvent.type(box, "Harbor{Escape}");
        expect(box).toHaveValue("Atlas");
        await userEvent.tab();
        expect(onCommit).not.toHaveBeenCalled();
    });
});

describe("a picker of more than one kind", () => {
    function Picker() {
        const [value, setValue] = useState("person:ada");
        return (
            <CellSelect
                aria-label="Assigned to"
                placeholder="Nobody"
                choices={[
                    {
                        label: "Teams",
                        choices: [{ value: "team:design", label: "Design" }],
                    },
                    {
                        label: "People",
                        choices: [{ value: "person:ada", label: "Ada" }],
                    },
                ]}
                value={value}
                onValueChange={setValue}
            />
        );
    }

    it("lists each kind under its heading, and shows the chosen one by its label", async () => {
        const user = userEvent.setup();
        render(<Picker />);
        const trigger = screen.getByRole("combobox", { name: "Assigned to" });
        expect(trigger).toHaveTextContent("Ada");

        await user.click(trigger);
        const teams = await screen.findByRole("group", { name: "Teams" });
        expect(
            within(teams).getByRole("option", { name: "Design" }),
        ).toBeInTheDocument();
        // The chosen one stands at the top, out of its kind, so a kind left
        // with nothing else shows no heading.
        expect(
            screen.queryByRole("group", { name: "People" }),
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("option", { name: "Design" }));
        expect(trigger).toHaveTextContent("Design");
    });
});
