import { Input } from "@base-ui/react/input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it } from "vitest";

import { Button } from "../controls/Button";
import { OptionCards } from "../controls/OptionCards";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Field } from "./Field";
import { Form, type FormErrors } from "./Form";
import { SearchSelect } from "./SearchSelect";
import { Select } from "./Select";
import { TextField } from "./TextField";

const ZONES = [
    { value: "utc", label: "UTC" },
    { value: "lisbon", label: "Europe/Lisbon" },
];

it("says why a value was refused under its control, read before its hint", async () => {
    function Refusing() {
        const [errors, setErrors] = useState<FormErrors>();
        return (
            <Form
                errors={errors}
                onSubmit={() =>
                    setErrors({ address: "An address needs a host." })
                }
            >
                <TextField
                    label="Address"
                    name="address"
                    hint="Where the service answers."
                    defaultValue="https://"
                />
                <Button type="submit">Save</Button>
            </Form>
        );
    }
    render(<Refusing />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    const address = screen.getByRole("textbox", { name: "Address" });
    expect(address).toBeInvalid();
    expect(address).toHaveAccessibleDescription(
        "An address needs a host. Where the service answers.",
    );
});

it("marks a picker invalid the same way", () => {
    render(
        <Form
            errors={{
                zone: "Choose where the clock runs.",
                searched: "Choose where the clock runs.",
            }}
            onSubmit={() => undefined}
        >
            <Select
                label="Time zone"
                name="zone"
                choices={ZONES}
                value=""
                placeholder="Choose a zone"
                onValueChange={() => undefined}
            />
            <SearchSelect
                label="Search zones"
                name="searched"
                searchLabel="Find a zone"
                placeholder="Choose a zone"
                choices={ZONES}
                value=""
                onValueChange={() => undefined}
            />
        </Form>,
    );
    for (const name of ["Time zone", "Search zones"]) {
        const picker = screen.getByRole("combobox", { name });
        expect(picker).toHaveAttribute("aria-invalid", "true");
        expect(picker).toHaveAccessibleDescription(
            "Choose where the clock runs.",
        );
    }
});

it("focuses a picker when its name is pressed, without opening its list", async () => {
    render(
        <>
            <Select
                label="Time zone"
                choices={ZONES}
                value="utc"
                onValueChange={() => undefined}
            />
            <SearchSelect
                label="Search zones"
                searchLabel="Find a zone"
                placeholder="Choose a zone"
                choices={ZONES}
                value=""
                onValueChange={() => undefined}
            />
        </>,
    );
    for (const name of ["Time zone", "Search zones"]) {
        await userEvent.click(screen.getByText(name));
        expect(screen.getByRole("combobox", { name })).toHaveFocus();
        expect(screen.queryByRole("listbox")).toBeNull();
    }
});

it("names the search box in a picker's list by its own words", async () => {
    render(
        <SearchSelect
            label="Search zones"
            searchLabel="Find a zone"
            placeholder="Choose a zone"
            choices={ZONES}
            value=""
            onValueChange={() => undefined}
        />,
    );
    await userEvent.click(
        screen.getByRole("combobox", { name: "Search zones" }),
    );
    expect(
        await screen.findByRole("combobox", { name: "Find a zone" }),
    ).toBeInTheDocument();
});

it("names and describes a native control given through Base UI's Input", () => {
    render(
        <Form errors={{ note: "A note is needed." }} onSubmit={() => undefined}>
            <Field label="Note" hint="Sent with each export.">
                <Input name="note" render={<textarea />} />
            </Field>
        </Form>,
    );
    const note = screen.getByRole("textbox", { name: "Note" });
    expect(note.tagName).toBe("TEXTAREA");
    expect(note).toBeInvalid();
    expect(note).toHaveAccessibleDescription(
        "A note is needed. Sent with each export.",
    );
});

it("holds only its control to a stated width, never its name or its messages", () => {
    render(
        <Form
            errors={{ port: "A port is a whole number up to 65535." }}
            onSubmit={() => undefined}
        >
            <TextField
                label="Port"
                name="port"
                hint="Where the service listens."
                width={20}
                value="80800"
                onChange={() => undefined}
            />
        </Form>,
    );
    const port = screen.getByRole("textbox", { name: "Port" });
    const held = port.parentElement;
    expect(held).toHaveStyle({ width: "calc(var(--spacing) * 20)" });
    expect(held).not.toContainElement(
        screen.getByText("A port is a whole number up to 65535."),
    );
    expect(held).not.toContainElement(
        screen.getByText("Where the service listens."),
    );
    expect(held).not.toContainElement(screen.getByText("Port"));
});

it("leaves each option of a group its own name, and describes it by its line and the field's hint", () => {
    render(
        <>
            <Field label="Export format" hint="How the file is written.">
                <SegmentedControl
                    label="Export format"
                    value="csv"
                    options={[
                        { value: "csv", label: "CSV" },
                        { value: "json", label: "JSON" },
                    ]}
                    onValueChange={() => undefined}
                />
            </Field>
            <Field label="Its fate" hint="Pick one.">
                <OptionCards
                    label="Its fate"
                    value={undefined}
                    options={[
                        {
                            value: "keep",
                            label: "Keep it",
                            description: "Nothing changes.",
                        },
                    ]}
                    onValueChange={() => undefined}
                />
            </Field>
        </>,
    );
    expect(
        screen.getByRole("radio", { name: "CSV" }),
    ).toHaveAccessibleDescription("How the file is written.");
    expect(screen.getByRole("radio", { name: "JSON" })).toBeInTheDocument();
    expect(
        screen.getByRole("radio", { name: "Keep it" }),
    ).toHaveAccessibleDescription("Nothing changes. Pick one.");
});
