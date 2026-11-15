import { render, screen, waitFor } from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { expect, it } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

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
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Base UI closes the dialog it is still holding, which is when the
    // stylesheet plays its leave; a dialog removed at once never closes.
    const closed: boolean[] = [];
    const watch = new MutationObserver((records) => {
        for (const record of records) {
            if (
                record.attributeName === "data-closed" &&
                record.target instanceof Element &&
                record.target.getAttribute("role") === "dialog"
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
