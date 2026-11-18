import { Dialog } from "@base-ui/react/dialog";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CellSelect } from "./Select";

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

it("chooses inside a dialog without closing it, its list portalled out of the dialog", async () => {
    function InDialog() {
        const [value, setValue] = useState("daily");
        return (
            <Dialog.Root defaultOpen>
                <Dialog.Portal>
                    <Dialog.Popup aria-label="Schedule">
                        <CellSelect
                            aria-label="Runs"
                            choices={[
                                { value: "daily", label: "Daily" },
                                { value: "weekly", label: "Weekly" },
                            ]}
                            value={value}
                            onValueChange={setValue}
                        />
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        );
    }
    const user = userEvent.setup();
    render(<InDialog />);
    const runs = screen.getByRole("combobox", { name: "Runs" });
    await user.click(runs);
    await user.click(await screen.findByRole("option", { name: "Weekly" }));
    expect(runs).toHaveTextContent("Weekly");
    expect(
        screen.getByRole("dialog", { name: "Schedule" }),
    ).toBeInTheDocument();
});
