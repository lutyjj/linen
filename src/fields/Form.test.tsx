import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "../controls/Button";
import { Form } from "./Form";
import { TextField } from "./TextField";

/** Answers the check that is waiting, when the test says so. */
let answer: () => void = () => undefined;

/** A form that refuses every submit at once, with the same words each time. */
function Refusing() {
    const [port, setPort] = useState("");
    const [error, setError] = useState<string>();
    return (
        <Form onSubmit={() => setError("A name is needed.")}>
            <TextField
                label="Port"
                value={port}
                onChange={(event) => setPort(event.target.value)}
            />
            <TextField
                label="Name"
                error={error}
                value=""
                onChange={() => undefined}
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
    expect(name).toHaveAccessibleDescription("A name is needed.");
});

it("takes the focus to a refusal each time, though its words are the same", async () => {
    render(<Refusing />);
    const name = screen.getByRole("textbox", { name: "Name" });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(name).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(name).toHaveFocus();
});

it("leaves the focus where the person types after a refusal", async () => {
    render(<Refusing />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    const port = screen.getByRole("textbox", { name: "Port" });
    await userEvent.click(port);
    await userEvent.keyboard("8080");
    expect(port).toHaveFocus();
    expect(port).toHaveValue("8080");
});

/**
 * A form whose check answers later and shows its waiting a render late, as a
 * query library's pending state does, after clearing the last refusal.
 */
function Checking() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    return (
        <Form
            onSubmit={() => {
                setError(undefined);
                setTimeout(() => setBusy(true), 0);
                return new Promise<void>((resolve) => {
                    answer = () => {
                        setBusy(false);
                        setError("A name is needed.");
                        resolve();
                    };
                });
            }}
        >
            <TextField
                label="Name"
                error={error}
                value=""
                onChange={() => undefined}
            />
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
    for (const submit of ["first", "again"]) {
        await userEvent.click(save);
        await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
        expect(save).toHaveAttribute("aria-busy", "true");
        expect(save).toHaveFocus();
        await act(() => {
            answer();
            return new Promise((resolve) => setTimeout(resolve, 0));
        });
        expect(name, submit).toHaveFocus();
    }
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

/** Fails the check that is waiting, when the test says so. */
let fail: () => void = () => undefined;

/** A form whose check may fail, which it shows on the field itself. */
function Failing({ onSubmit }: { onSubmit: () => void }) {
    const [error, setError] = useState<string>();
    return (
        <Form
            onSubmit={() => {
                onSubmit();
                const check = new Promise<void>((_, reject) => {
                    fail = () => reject(new Error("No answer"));
                });
                check.catch(() => setError("The check did not answer."));
                return check;
            }}
        >
            <TextField
                label="Name"
                error={error}
                value=""
                onChange={() => undefined}
            />
            <Button type="submit">Save</Button>
        </Form>
    );
}

it("hears a failed answer as it hears a refusal, and takes the next submit", async () => {
    const submitted = vi.fn();
    render(<Failing onSubmit={submitted} />);
    const save = screen.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await act(() => {
        fail();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription("The check did not answer.");
    await userEvent.click(save);
    expect(submitted).toHaveBeenCalledTimes(2);
});
