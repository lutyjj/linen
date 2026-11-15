import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchSelect } from "./SearchSelect";
import { Select } from "./Select";
import { TextField } from "./TextField";

const ZONES = [
    { value: "utc", label: "UTC" },
    { value: "lisbon", label: "Europe/Lisbon" },
];

describe("a field that holds a refused value", () => {
    it("says why under the control, and the control is described by it", () => {
        render(
            <TextField
                label="Address"
                hint="Where the service answers."
                error="An address needs a host."
                value="https://"
                onChange={() => undefined}
            />,
        );
        const address = screen.getByRole("textbox", { name: "Address" });
        expect(address).toBeInvalid();
        expect(address).toHaveAccessibleDescription(
            "An address needs a host. Where the service answers.",
        );
    });

    it("is valid again once its error is gone", () => {
        render(
            <TextField
                label="Address"
                hint="Where the service answers."
                value="https://example.com"
                onChange={() => undefined}
            />,
        );
        const address = screen.getByRole("textbox", { name: "Address" });
        expect(address).not.toHaveAttribute("aria-invalid");
        expect(address).toHaveAccessibleDescription(
            "Where the service answers.",
        );
    });

    it("keeps what the caller says describes the control", () => {
        render(
            <>
                <p id="rules">Letters and digits only.</p>
                <TextField
                    label="Name"
                    hint="Everyone sees it."
                    error="A name is needed."
                    aria-describedby="rules"
                    value=""
                    onChange={() => undefined}
                />
            </>,
        );
        expect(
            screen.getByRole("textbox", { name: "Name" }),
        ).toHaveAccessibleDescription(
            "A name is needed. Everyone sees it. Letters and digits only.",
        );
    });

    it("marks a picker invalid the same way", () => {
        render(
            <>
                <Select
                    label="Time zone"
                    choices={ZONES}
                    value=""
                    placeholder="Choose a zone"
                    error="Choose where the clock runs."
                    onValueChange={() => undefined}
                />
                <SearchSelect
                    label="Search zones"
                    searchLabel="Find a zone"
                    placeholder="Choose a zone"
                    choices={ZONES}
                    value=""
                    error="Choose where the clock runs."
                    onValueChange={() => undefined}
                />
            </>,
        );
        for (const name of ["Time zone", "Search zones"]) {
            const picker = screen.getByRole("combobox", { name });
            expect(picker).toHaveAttribute("aria-invalid", "true");
            expect(picker).toHaveAccessibleDescription(
                "Choose where the clock runs.",
            );
        }
    });
});
