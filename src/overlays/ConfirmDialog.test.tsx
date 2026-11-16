import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { ConfirmDialog } from "./ConfirmDialog";

it("leaves on Escape and on a press beside it while nothing is under way", async () => {
    const closing = vi.fn();
    render(
        <ConfirmDialog
            open
            onOpenChange={closing}
            title="Revoke the token?"
            confirmLabel="Revoke"
            onConfirm={() => undefined}
        />,
    );
    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.body);
    expect(closing).toHaveBeenCalledTimes(2);
    expect(closing).toHaveBeenNthCalledWith(1, false);
    expect(closing).toHaveBeenNthCalledWith(2, false);
});

it("waits on the act it confirms, and cannot be left until it is done", async () => {
    const closing = vi.fn();
    let settle: () => void = () => undefined;
    const confirmed = vi.fn(
        () => new Promise<void>((resolve) => (settle = resolve)),
    );
    render(
        <ConfirmDialog
            open
            onOpenChange={closing}
            title="Revoke the token?"
            confirmLabel="Revoke"
            onConfirm={confirmed}
        />,
    );
    const revoke = screen.getByRole("button", { name: "Revoke" });
    const cancel = screen.getByRole("button", { name: ENGLISH.cancel });
    await userEvent.click(revoke);
    expect(revoke).toHaveAttribute("aria-busy", "true");
    expect(cancel).toBeDisabled();
    await userEvent.click(revoke);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.body);
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(closing).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(() => {
        settle();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(revoke).not.toHaveAttribute("aria-busy");
    expect(cancel).toBeEnabled();
});

it("ends the wait when the act fails, for the app to say why", async () => {
    let fail: () => void = () => undefined;
    render(
        <ConfirmDialog
            open
            onOpenChange={() => undefined}
            title="Revoke the token?"
            confirmLabel="Revoke"
            onConfirm={() => {
                const revoking = new Promise<void>((_, reject) => {
                    fail = () => reject(new Error("No answer"));
                });
                revoking.catch(() => undefined);
                return revoking;
            }}
        />,
    );
    const revoke = screen.getByRole("button", { name: "Revoke" });
    await userEvent.click(revoke);
    expect(revoke).toHaveAttribute("aria-busy", "true");
    await act(() => {
        fail();
        return new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(revoke).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("button", { name: ENGLISH.cancel })).toBeEnabled();
});

it("leaves closing to the app once the act is confirmed", async () => {
    const closing = vi.fn();
    const confirmed = vi.fn();
    render(
        <ConfirmDialog
            open
            onOpenChange={closing}
            title="Revoke the token?"
            confirmLabel="Revoke"
            onConfirm={confirmed}
        />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Revoke" }));
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(closing).not.toHaveBeenCalled();
});
