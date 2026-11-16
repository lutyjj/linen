import { render, screen, waitFor } from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { afterEach, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";
import { PromptDialog } from "./PromptDialog";

/** A part of the page that leaves with an exit, holding a dialog. */
function Holder({ shown, open = false }: { shown: boolean; open?: boolean }) {
    return (
        <AnimatePresence>
            {shown && (
                <div data-testid="holder">
                    <ConfirmDialog
                        open={open}
                        onOpenChange={() => undefined}
                        title="Delete the tag?"
                        confirmLabel="Delete"
                        onConfirm={() => undefined}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}

it("a shut dialog does not hold up the part of the page leaving around it", async () => {
    const { rerender } = render(<Holder shown />);
    expect(screen.getByTestId("holder")).toBeInTheDocument();

    rerender(<Holder shown={false} />);

    await waitFor(() => expect(screen.queryByTestId("holder")).toBeNull());
});

it("an open dialog is closed, and so leaves with its own exit, before the part around it goes", async () => {
    const { rerender } = render(<Holder shown open />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Base UI closes the dialog it is still holding, which is when the
    // stylesheet plays its leave; a dialog removed at once never closes.
    const closed: boolean[] = [];
    const watch = new MutationObserver((records) => {
        for (const record of records) {
            if (
                record.attributeName === "data-closed" &&
                record.target instanceof Element &&
                record.target.getAttribute("role") === "alertdialog"
            ) {
                closed.push(true);
            }
        }
    });
    watch.observe(document.body, { subtree: true, attributes: true });
    rerender(<Holder shown={false} open />);

    await waitFor(() => expect(screen.queryByTestId("holder")).toBeNull());
    watch.disconnect();
    expect(closed.length).toBeGreaterThan(0);
});

it("keeps the words it was open with while it leaves", async () => {
    // The caller forgets what the dialog was about the moment it closes.
    const asking = (subject?: string) => (
        <ConfirmDialog
            open={subject !== undefined}
            onOpenChange={() => undefined}
            title={`Delete ${subject ?? ""}?`}
            confirmLabel="Delete"
            onConfirm={() => undefined}
        />
    );
    const { rerender } = render(asking("Atlas"));
    rerender(asking());
    expect(screen.getByText("Delete Atlas?")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Delete Atlas?")).toBeNull());
    expect(screen.queryByText("Delete ?")).toBeNull();
});

/** A visual viewport an on-screen keyboard has shortened, which the test moves. */
function keyboardUp() {
    const visible = Object.assign(new EventTarget(), {
        height: 380,
        offsetTop: 0,
        scale: 1,
    });
    Object.defineProperty(window, "visualViewport", {
        configurable: true,
        value: visible,
    });
    return visible;
}

afterEach(() => {
    Reflect.deleteProperty(window, "visualViewport");
});

it("stands in the part of the window a person can see, as a keyboard leaves it", () => {
    const visible = keyboardUp();
    render(
        <ConfirmDialog
            open
            onOpenChange={() => undefined}
            title="Delete the tag?"
            confirmLabel="Delete"
            onConfirm={() => undefined}
        />,
    );
    // The dialog stands in the room the stylesheet bounds by these.
    const room = screen.getByRole("alertdialog").parentElement;
    const bounds = () => [
        room?.style.getPropertyValue("--visible-top"),
        room?.style.getPropertyValue("--visible-height"),
    ];
    expect(bounds()).toEqual(["0px", "380px"]);

    Object.assign(visible, { height: 300, offsetTop: 120 });
    visible.dispatchEvent(new Event("scroll"));
    expect(bounds()).toEqual(["120px", "300px"]);

    // Zoomed in, it stands where the page's own viewport puts it.
    visible.scale = 2;
    visible.dispatchEvent(new Event("resize"));
    expect(bounds()).toEqual(["", ""]);
});

it("scrolls the field being typed in back into view as a keyboard opens", async () => {
    const visible = keyboardUp();
    // The page has no layout here; what is asked of it is the oracle.
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    render(
        <PromptDialog
            open
            onOpenChange={() => undefined}
            title="Rename the project"
            label="Name"
            placeholder="Atlas"
            confirmLabel="Rename"
            onConfirm={() => undefined}
        />,
    );
    const name = screen.getByRole("textbox", { name: "Name" });
    await waitFor(() => expect(name).toHaveFocus());
    visible.height = 300;
    visible.dispatchEvent(new Event("resize"));
    expect(scroll).toHaveBeenCalledWith({ block: "nearest" });
    expect(scroll.mock.contexts.at(-1)).toBe(name);

    // A view that grows, or a pinch, leaves the focus where it was put.
    scroll.mockClear();
    visible.height = 380;
    visible.dispatchEvent(new Event("resize"));
    Object.assign(visible, { height: 190, scale: 2 });
    visible.dispatchEvent(new Event("resize"));
    expect(scroll).not.toHaveBeenCalled();
    scroll.mockRestore();
});

it("stops following the window once it has gone", () => {
    const visible = keyboardUp();
    const { unmount } = render(
        <ConfirmDialog
            open
            onOpenChange={() => undefined}
            title="Delete the tag?"
            confirmLabel="Delete"
            onConfirm={() => undefined}
        />,
    );
    const room = screen.getByRole("alertdialog").parentElement;
    unmount();
    visible.height = 200;
    visible.dispatchEvent(new Event("resize"));
    visible.dispatchEvent(new Event("scroll"));
    expect(room?.style.getPropertyValue("--visible-height")).toBe("380px");
});
