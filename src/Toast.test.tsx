import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";
import {
    type ToastMessage,
    ToastProvider,
    UNDO_WINDOW_MS,
    useToast,
} from "./Toast";
import { ENGLISH } from "./words";

let show: (message: ToastMessage) => void;

function Speaker() {
    show = useToast().show;
    return null;
}

beforeEach(() => {
    vi.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout"],
        shouldAdvanceTime: true,
    });
    render(
        <ToastProvider>
            <Speaker />
        </ToastProvider>,
    );
});

afterEach(() => vi.useRealTimers());

/** Where toasts stand, found as a reader finds it: by its name. */
const region = () =>
    screen.getByRole("region", { name: ENGLISH.notifications });

const say = (message: ToastMessage) =>
    act(() => {
        show(message);
    });

it("stands while its undo is on offer, then leaves", () => {
    say({ text: "Entry removed", onUndo: () => undefined });
    expect(screen.getAllByText("Entry removed")).not.toHaveLength(0);
    act(() => {
        vi.advanceTimersByTime(UNDO_WINDOW_MS);
    });
    expect(screen.queryAllByText("Entry removed")).toHaveLength(0);
});

it("is announced through a live region that stays in the page", () => {
    const standing = region();
    expect(standing).toHaveAttribute("aria-live", "polite");
    say({ text: "Token revoked" });
    expect(standing).toHaveTextContent("Token revoked");
    expect(region()).toBe(standing);
});

it("keeps a toast that offers an answer when an acknowledgement passes", () => {
    say({
        text: "The import failed.",
        action: { label: "Try again", run: () => undefined },
    });
    say({ text: "Saved" });
    expect(region()).toHaveTextContent("The import failed.");
});

it("lets a sticky message replace a toast that offers an answer", () => {
    say({
        text: "The import failed.",
        action: { label: "Try again", run: () => undefined },
    });
    say({ text: "The server refused the password.", sticky: true });
    expect(region()).toHaveTextContent("The server refused the password.");
    act(() => {
        vi.advanceTimersByTime(UNDO_WINDOW_MS * 2);
    });
    expect(region()).toHaveTextContent("The server refused the password.");
});

it("tells its sender when it is dismissed, and not when its action runs", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDismiss = vi.fn();
    const run = vi.fn();
    say({
        text: "Uploading",
        sticky: true,
        onDismiss,
        action: { label: "Stop", run },
    });
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(run).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();

    say({ text: "Uploading", sticky: true, onDismiss });
    // Base UI keeps the close button from readers until the region holds the
    // pointer or focus; a pointer finds it by its label.
    await user.click(screen.getByLabelText(ENGLISH.dismiss));
    expect(onDismiss).toHaveBeenCalledOnce();
});

it("shows its words once, and says the same words again as a new saying", () => {
    say({ text: "Saved" });
    const first = screen.getByText("Saved");
    say({ text: "Saved" });
    const second = screen.getByText("Saved");
    expect(second).not.toBe(first);
    expect(region()).toContainElement(second);
});

it("is still read out while a modal dialog hides the rest of the page", () => {
    render(
        <ConfirmDialog
            open
            onOpenChange={() => undefined}
            title="Remove it?"
            confirmLabel="Remove"
            onConfirm={() => undefined}
        />,
    );
    say({ text: "That name is already taken" });
    expect(region()).toHaveTextContent("That name is already taken");
});

it("leaves standing what its own action says next", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDismiss = vi.fn();
    say({
        text: "No reply",
        sticky: true,
        action: {
            label: "Retry",
            run: () => show({ text: "Asking again", sticky: true, onDismiss }),
        },
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(region()).toHaveTextContent("Asking again");
    expect(onDismiss).not.toHaveBeenCalled();
});
