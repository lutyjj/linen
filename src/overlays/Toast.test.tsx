import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ENGLISH } from "../foundation/words";
import { markup } from "../test/markup";
import {
    type ToastMessage,
    ToastProvider,
    UNDO_WINDOW_MS,
    useToast,
} from "./Toast";

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

it("stands while its undo is on offer, then leaves", async () => {
    say({ text: "Entry removed", onUndo: () => undefined });
    expect(screen.getAllByText("Entry removed")).not.toHaveLength(0);
    act(() => {
        vi.advanceTimersByTime(UNDO_WINDOW_MS - 1);
    });
    expect(screen.getAllByText("Entry removed")).not.toHaveLength(0);
    act(() => {
        vi.advanceTimersByTime(1);
    });
    // It goes once its leave has played, a frame later.
    await waitFor(() =>
        expect(screen.queryAllByText("Entry removed")).toHaveLength(0),
    );
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

it("offers one answer, undo or an action", () => {
    const both = {
        text: "Entry removed",
        onUndo: () => undefined,
        action: { label: "Restore", run: () => undefined },
    };
    // @ts-expect-error A toast offers undo or an action, not both.
    say(both);
    expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ENGLISH.undo })).toBeNull();
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

it("draws no room for a lead that is nothing", () => {
    // What the toast holds; its own state moves as it arrives.
    const held = () =>
        [...(screen.getByText("Saved").parentElement?.children ?? [])]
            .map(markup)
            .join("");
    say({ text: "Saved" });
    const toast = held();
    say({ text: "Saved", lead: false });
    expect(held()).toBe(toast);
});
