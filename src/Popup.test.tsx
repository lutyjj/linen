import { render, screen, waitFor } from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { expect, it } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

/** A part of the page that leaves with an exit, holding a dialog that is shut. */
function Holder({ shown }: { shown: boolean }) {
    return (
        <AnimatePresence>
            {shown && (
                <div data-testid="holder">
                    <ConfirmDialog
                        open={false}
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
