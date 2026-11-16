import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import type { FormErrors } from "../fields/Form";
import { TextField } from "../fields/TextField";
import { ENGLISH } from "../foundation/words";
import { FormDialog } from "./Dialog";

/** Answers the check that is waiting, when the test says so. */
let answer: () => void = () => undefined;

/** A dialog whose check of the name takes a moment and refuses it. */
function Making({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    const [errors, setErrors] = useState<FormErrors>();
    return (
        <FormDialog
            open
            onOpenChange={onOpenChange}
            title="New token"
            confirmLabel="Create"
            errors={errors}
            onConfirm={() =>
                new Promise<void>((resolve) => {
                    answer = () => {
                        setErrors({ name: "A token already has this name." });
                        resolve();
                    };
                })
            }
        >
            <TextField label="Port" name="port" defaultValue="80" />
            <TextField label="Name" name="name" defaultValue="Nightly" />
        </FormDialog>
    );
}

it("waits on its confirm, then takes the focus to the field it refused", async () => {
    const closing = vi.fn();
    render(<Making onOpenChange={closing} />);
    const create = screen.getByRole("button", { name: "Create" });
    await userEvent.click(create);
    expect(create).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: ENGLISH.cancel })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(closing).not.toHaveBeenCalled();

    // The answer reaches the dialog and its form in turn; a task later both
    // have heard it.
    await act(() => {
        answer();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(create).not.toHaveAttribute("aria-busy");
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription("A token already has this name.");
});
