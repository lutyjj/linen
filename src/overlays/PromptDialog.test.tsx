import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { PromptDialog } from "./PromptDialog";

/** A prompt the app answers as the test says: refused, or kept. */
function Renaming({
    open = true,
    onOpenChange = () => undefined,
    onConfirm,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm: (name: string) => string | undefined;
}) {
    const [error, setError] = useState<string>();
    return (
        <PromptDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Rename the project"
            label="Name"
            placeholder="Atlas"
            confirmLabel="Rename"
            defaultValue="Atlas"
            error={error}
            onConfirm={(name) => setError(onConfirm(name))}
        />
    );
}

it("hands over the answer trimmed, and stays open until the app closes it", async () => {
    const closing = vi.fn();
    const confirmed = vi.fn(() => undefined);
    render(<Renaming onOpenChange={closing} onConfirm={confirmed} />);
    const box = screen.getByRole("textbox", { name: "Name" });
    await userEvent.clear(box);
    await userEvent.type(box, "  Orion  {Enter}");
    expect(confirmed).toHaveBeenCalledWith("Orion");
    expect(closing).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
});

it("says why an answer was refused under the box, which takes the focus", async () => {
    render(<Renaming onConfirm={() => "A project has this name."} />);
    await userEvent.click(screen.getByRole("button", { name: "Rename" }));
    const box = screen.getByRole("textbox", { name: "Name" });
    expect(box).toHaveFocus();
    expect(box).toHaveAccessibleDescription("A project has this name.");
});

it("opens on its default each time, whatever was typed before", async () => {
    const { rerender } = render(<Renaming onConfirm={() => undefined} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "ia");
    rerender(<Renaming open={false} onConfirm={() => undefined} />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    rerender(<Renaming onConfirm={() => undefined} />);
    expect(await screen.findByRole("textbox", { name: "Name" })).toHaveValue(
        "Atlas",
    );
});
