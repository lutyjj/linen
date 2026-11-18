import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { MotionProvider } from "../motion/MotionProvider";
import { Swap } from "../motion/Swap";
import { ConfirmDialog } from "./ConfirmDialog";
import { DialogCancel, DialogLayout } from "./Dialog";
import { DialogRoot, DialogShell } from "./DialogRoot";

it("is an alert, which Escape leaves and a press beside it does not", async () => {
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
    expect(
        screen.getByRole("alertdialog", { name: "Revoke the token?" }),
    ).toBeInTheDocument();
    await userEvent.click(document.body);
    expect(closing).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(closing).toHaveBeenCalledExactlyOnceWith(false);
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
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

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

/**
 * A stepped swap whose step asks first. The app moves the step on and closes
 * the dialog in either order, a moment apart, or both once the act the
 * dialog waits on is done, or moves the step on at once and closes the
 * dialog once `done` settles.
 */
function Guide({
    order,
    done,
}: {
    order: "step first" | "close first" | "wait" | "step, then wait";
    done?: Promise<void>;
}) {
    const [step, setStep] = useState(1);
    const [asking, setAsking] = useState(false);
    const goOn = () => setStep(step + 1);
    const close = () => setAsking(false);
    return (
        <MotionProvider>
            <button type="button" onClick={() => setAsking(true)}>
                Rename the guide
            </button>
            <Swap view={`step ${step}`} stepped>
                <p>
                    Step {step} of the guide.{" "}
                    <button type="button" onClick={() => setAsking(true)}>
                        Next
                    </button>
                </p>
            </Swap>
            <ConfirmDialog
                open={asking}
                onOpenChange={setAsking}
                title="Skip the test?"
                confirmLabel="Skip it"
                onConfirm={() => {
                    if (order === "step, then wait") {
                        goOn();
                        return done?.then(close);
                    }
                    if (order === "wait") {
                        return Promise.resolve().then(() => {
                            goOn();
                            close();
                        });
                    }
                    const [now, then] =
                        order === "step first" ? [goOn, close] : [close, goOn];
                    now();
                    queueMicrotask(then);
                }}
            />
        </MotionProvider>
    );
}

for (const order of ["step first", "close first", "wait"] as const) {
    it(`leaves the focus on the step its act moved on once it has closed (${order})`, async () => {
        const user = userEvent.setup();
        render(<Guide order={order} />);
        // A dialog opened before from a control that stays is not where
        // this one returns the focus.
        await user.click(
            screen.getByRole("button", { name: "Rename the guide" }),
        );
        await user.click(screen.getByRole("button", { name: ENGLISH.cancel }));
        await waitFor(() =>
            expect(
                screen.queryByRole("alertdialog", { hidden: true }),
            ).toBeNull(),
        );

        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.click(screen.getByRole("button", { name: "Skip it" }));
        await waitFor(() =>
            expect(
                screen.queryByRole("alertdialog", { hidden: true }),
            ).toBeNull(),
        );
        await act(() => Promise.resolve());

        expect(
            screen.getByText("Step 2 of the guide.").parentElement,
        ).toHaveFocus();
    });
}

for (const move of ["a press on its words", "Tab"] as const) {
    it(`leaves the focus on the step its act moved on though the focus moved inside it while it waited (${move})`, async () => {
        const user = userEvent.setup();
        let settle = () => undefined as void;
        const done = new Promise<void>((resolve) => (settle = resolve));
        render(<Guide order="step, then wait" done={done} />);
        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.click(screen.getByRole("button", { name: "Skip it" }));
        if (move === "Tab") {
            await user.tab();
            // Base UI's guard, beside the dialog, sends it back inside.
            await waitFor(() =>
                expect(screen.getByRole("alertdialog")).toContainElement(
                    document.activeElement as HTMLElement,
                ),
            );
        } else {
            await user.click(screen.getByText("Skip the test?"));
        }
        await act(async () => {
            settle();
            await done;
        });
        await waitFor(() =>
            expect(
                screen.queryByRole("alertdialog", { hidden: true }),
            ).toBeNull(),
        );
        await act(() => Promise.resolve());

        expect(
            screen.getByText("Step 2 of the guide.").parentElement,
        ).toHaveFocus();
    });
}

/** A stepped swap in a dialog's body whose step asks in a dialog of its own. */
function Invitation() {
    const [step, setStep] = useState(1);
    const [asking, setAsking] = useState(false);
    return (
        <MotionProvider>
            <DialogRoot open onOpenChange={() => undefined}>
                <DialogShell open>
                    <DialogLayout
                        title="Invite someone"
                        actions={<DialogCancel />}
                    >
                        <Swap view={`step ${step}`} stepped>
                            <p>
                                Step {step} of the invitation.{" "}
                                <button
                                    type="button"
                                    onClick={() => setAsking(true)}
                                >
                                    Next
                                </button>
                            </p>
                        </Swap>
                        <ConfirmDialog
                            open={asking}
                            onOpenChange={setAsking}
                            title="Send it now?"
                            confirmLabel="Send"
                            onConfirm={() => {
                                setStep(step + 1);
                                setAsking(false);
                            }}
                        />
                    </DialogLayout>
                </DialogShell>
            </DialogRoot>
        </MotionProvider>
    );
}

it("leaves the focus on the step its act moved on in the dialog it was asked over", async () => {
    const user = userEvent.setup();
    render(<Invitation />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() =>
        expect(screen.queryByRole("alertdialog", { hidden: true })).toBeNull(),
    );
    await act(() => Promise.resolve());

    expect(
        screen.getByText("Step 2 of the invitation.").parentElement,
    ).toHaveFocus();
});
