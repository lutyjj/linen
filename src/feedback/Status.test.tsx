import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { ExplainedStatus, Status } from "./Status";

it("says its state in words, and keeps its dot from readers", () => {
    const { container } = render(
        <Status tone="positive" active>
            Running
        </Status>,
    );
    expect(screen.getByText("Running")).toBeVisible();
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).not.toBeNull();
    // The beat is the stylesheet's (motion.css), keyed on this class.
    expect(dot).toHaveClass("live-mark");
});

it("explains a state it offers no action for to the pointer, a press and the keyboard", async () => {
    const why = "Viewers see the settings but cannot change them.";
    render(
        <>
            <ExplainedStatus description={why}>Read only</ExplainedStatus>
            <Status>Paused</Status>
        </>,
    );
    // A state without an explanation is words, not a control.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    const state = screen.getByRole("button", { name: "Read only" });

    await userEvent.hover(state);
    expect(
        await screen.findByRole("dialog", { name: "Read only" }),
    ).toHaveAccessibleDescription(why);
    await userEvent.unhover(state);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await userEvent.tab();
    expect(state).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const shown = await screen.findByRole("dialog", { name: "Read only" });
    expect(shown).toHaveAccessibleDescription(why);
    // The focus goes to it, so it is read out.
    await waitFor(() => expect(shown).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(state).toHaveFocus());

    await userEvent.click(state);
    expect(
        await screen.findByRole("dialog", { name: "Read only" }),
    ).toHaveAccessibleDescription(why);
});

it("is a plain status when its description is nothing", () => {
    const plain = render(<Status tone="warn">Read only</Status>);
    const status = plain.container.innerHTML;
    plain.unmount();
    for (const nothing of [
        undefined,
        null,
        false,
        true,
        "",
        [],
        [[null, ""], false],
    ]) {
        const { container, unmount } = render(
            <ExplainedStatus tone="warn" description={nothing}>
                Read only
            </ExplainedStatus>,
        );
        expect(screen.queryByRole("button")).toBeNull();
        expect(container.innerHTML).toBe(status);
        unmount();
    }
});
