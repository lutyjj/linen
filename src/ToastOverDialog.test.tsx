import { act, render, screen, waitFor } from "@testing-library/react";
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
});

afterEach(() => vi.useRealTimers());

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

const say = (message: ToastMessage) =>
    act(() => {
        show(message);
    });

/**
 * A dialog standing open under a toast, with focus on its Cancel, and what
 * the dialog was asked.
 */
async function standing(message: ToastMessage) {
    const onOpenChange = vi.fn();
    render(
        <ToastProvider>
            <Speaker />
            <ConfirmDialog
                open
                onOpenChange={onOpenChange}
                title="Remove it?"
                confirmLabel="Remove"
                onConfirm={() => undefined}
            />
        </ToastProvider>,
    );
    say(message);
    // The dialog moves focus into itself once it has opened; focus is set
    // after that, or the dialog's own move would take it away again.
    const dialog = screen.getByRole("dialog", { name: "Remove it?" });
    await waitFor(() => {
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });
    const cancel = screen.getByRole("button", { name: ENGLISH.cancel });
    act(() => {
        cancel.focus();
    });
    return { onOpenChange, cancel };
}

const toast = (name: string) => screen.getByRole("dialog", { name });

// Base UI closes a modal dialog only for a press on its backdrop, which the
// toast stands above; this holds linen to that.
it("answers a press on its undo while a dialog stands, and the dialog stays", async () => {
    const undo = vi.fn();
    const { onOpenChange, cancel } = await standing({
        text: "Entry removed",
        onUndo: undo,
    });

    await user().click(screen.getByRole("button", { name: ENGLISH.undo }));

    expect(undo).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    // The press took no focus from where the person was.
    expect(cancel).toHaveFocus();
});

it("closes on Escape from inside it, and the dialog beneath stays", async () => {
    const { onOpenChange } = await standing({
        text: "The import failed.",
        sticky: true,
    });
    const keys = user();

    await keys.keyboard("{F6}");
    await keys.tab();
    await keys.keyboard("{Escape}");

    await waitFor(() => {
        expect(
            screen.queryByRole("dialog", { name: "The import failed." }),
        ).toBeNull();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
});

it("takes the keyboard to the toast on F6 and back on Shift+Tab", async () => {
    const { onOpenChange, cancel } = await standing({
        text: "The import failed.",
        action: { label: "Try again", run: () => undefined },
    });
    const keys = user();

    await keys.keyboard("{F6}");
    expect(
        screen.getByRole("region", { name: ENGLISH.notifications }),
    ).toHaveFocus();
    await keys.tab();
    expect(toast("The import failed.")).toHaveFocus();
    await keys.tab({ shift: true });
    expect(cancel).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
});

it("keeps its undo while the keyboard is on it", async () => {
    await standing({ text: "Entry removed", onUndo: () => undefined });
    const keys = user();

    await keys.keyboard("{F6}");
    await keys.tab();
    act(() => {
        vi.advanceTimersByTime(UNDO_WINDOW_MS * 2);
    });

    expect(toast("Entry removed")).toHaveFocus();
    expect(
        screen.getByRole("button", { name: ENGLISH.undo }),
    ).toBeInTheDocument();
});

it("keeps the keyboard on a toast another saying replaces", async () => {
    await standing({ text: "Asking 1 of 3", sticky: true });
    const keys = user();

    await keys.keyboard("{F6}");
    await keys.tab();
    say({ text: "Asked 3", sticky: true });

    expect(toast("Asked 3")).toHaveFocus();
});

it("keeps the keyboard on the toast when the next saying drops its control", async () => {
    await standing({ text: "Asking 1 of 3", sticky: true });
    const keys = user();

    await keys.keyboard("{F6}");
    await keys.tab();
    await keys.tab();
    expect(screen.getByLabelText(ENGLISH.dismiss)).toHaveFocus();
    say({ text: "Asked 3" });

    expect(toast("Asked 3")).toHaveFocus();
});

it("gives focus back to where it came from once answered", async () => {
    const undo = vi.fn();
    const { onOpenChange, cancel } = await standing({
        text: "Entry removed",
        onUndo: undo,
    });
    const keys = user();

    await keys.keyboard("{F6}");
    await keys.tab();
    await keys.tab();
    expect(screen.getByRole("button", { name: ENGLISH.undo })).toHaveFocus();
    await keys.keyboard("{Enter}");

    expect(undo).toHaveBeenCalledOnce();
    await waitFor(() => {
        expect(cancel).toHaveFocus();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
});
