import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "../controls/Button";
import { Form, type FormErrors } from "./Form";
import { TextField } from "./TextField";

/** The one answer the app gives every submit, held as one object. */
const NEEDED: FormErrors = { name: "A name is needed." };

/** A form that refuses every submit at once, with the same answer each time. */
function Refusing() {
    const [port, setPort] = useState("");
    const [name, setName] = useState("");
    const [errors, setErrors] = useState<FormErrors>();
    return (
        <Form errors={errors} onSubmit={() => setErrors(NEEDED)}>
            <TextField
                label="Port"
                name="port"
                value={port}
                onChange={(event) => setPort(event.target.value)}
            />
            <TextField
                label="Name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit">Save</Button>
        </Form>
    );
}

it("takes a refused submit to the field it refused, read with its error", async () => {
    render(<Refusing />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name).toHaveFocus();
    expect(name).toBeInvalid();
    expect(name).toHaveAccessibleDescription("A name is needed.");
});

it("says the same refusal again after an edit, and takes the focus to it", async () => {
    render(<Refusing />);
    const name = screen.getByRole("textbox", { name: "Name" });
    const save = screen.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await userEvent.type(name, "A");
    expect(name).not.toHaveAccessibleDescription();
    await userEvent.click(save);
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription("A name is needed.");
});

it("refuses a value its field's own check refuses, without asking the app", async () => {
    const submitted = vi.fn();
    render(
        <Form onSubmit={submitted}>
            <TextField
                label="Port"
                defaultValue="80800"
                validate={(value) =>
                    Number(value) > 65535 ? "A port goes up to 65535." : null
                }
            />
            <Button type="submit">Save</Button>
        </Form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    const port = screen.getByRole("textbox", { name: "Port" });
    expect(submitted).not.toHaveBeenCalled();
    expect(port).toHaveFocus();
    expect(port).toHaveAccessibleDescription("A port goes up to 65535.");
});

/** Answers the check that is waiting, when the test says so. */
let answer: () => void = () => undefined;

/**
 * A form whose check answers later and shows its waiting a render late, as a
 * query library's pending state does.
 */
function Checking() {
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<FormErrors>();
    return (
        <Form
            errors={errors}
            onSubmit={() => {
                setTimeout(() => setBusy(true), 0);
                return new Promise<void>((resolve) => {
                    answer = () => {
                        setBusy(false);
                        setErrors({ name: "A name is needed." });
                        resolve();
                    };
                });
            }}
        >
            <TextField label="Name" name="name" defaultValue="" />
            <Button type="submit" busy={busy}>
                Save
            </Button>
        </Form>
    );
}

it("takes the focus once the promise its submit returned has settled", async () => {
    render(<Checking />);
    const name = screen.getByRole("textbox", { name: "Name" });
    const save = screen.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(save).toHaveAttribute("aria-busy", "true");
    expect(save).toHaveFocus();
    await act(() => {
        answer();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription("A name is needed.");
});

it("starts nothing while the answer to the last submit is still to come", async () => {
    const submitted = vi.fn(() => new Promise<void>(() => undefined));
    render(
        <Form onSubmit={submitted}>
            <Button type="submit">Save</Button>
        </Form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(submitted).toHaveBeenCalledTimes(1);
});

it("leaves a corrected field clear when the next answer fails", async () => {
    let fail: () => void = () => undefined;
    function Correcting() {
        const [errors, setErrors] = useState<FormErrors>();
        return (
            <Form
                errors={errors}
                onSubmit={() => {
                    if (errors === undefined) return setErrors(NEEDED);
                    const check = new Promise<void>((_, reject) => {
                        fail = () => reject(new Error("No answer"));
                    });
                    // The app says what failed, in a notice of its own.
                    check.catch(() => undefined);
                    return check;
                }}
            >
                <TextField label="Name" name="name" defaultValue="" />
                <Button type="submit">Save</Button>
            </Form>
        );
    }
    render(<Correcting />);
    const name = screen.getByRole("textbox", { name: "Name" });
    const save = screen.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await userEvent.type(name, "Atlas");
    await userEvent.click(save);
    await act(() => {
        fail();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(name).not.toHaveAccessibleDescription();
    expect(save).toHaveFocus();
});

it("ends the wait when the answer fails, and takes the next submit", async () => {
    let fail: () => void = () => undefined;
    const submitted = vi.fn(() => {
        const check = new Promise<void>((_, reject) => {
            fail = () => reject(new Error("No answer"));
        });
        // The app says what failed, in a notice of its own.
        check.catch(() => undefined);
        return check;
    });
    render(
        <Form onSubmit={submitted}>
            <Button type="submit">Save</Button>
        </Form>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await act(() => {
        fail();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    await userEvent.click(save);
    expect(submitted).toHaveBeenCalledTimes(2);
});
