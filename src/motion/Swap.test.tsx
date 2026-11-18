import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { MotionProvider } from "./MotionProvider";
import { Swap } from "./Swap";

/**
 * A form that goes on to what it made. Its submit stands beside the region,
 * as a dialog's actions do, and goes with the step; Enter in the field
 * submits from inside the view that leaves.
 */
function Invitation({ stepped = false }: { stepped?: boolean }) {
    const [made, setMade] = useState(false);
    return (
        <MotionProvider>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setMade(true);
                }}
            >
                <Swap view={made ? "code" : "form"} stepped={stepped}>
                    {made ? (
                        <p>
                            The code is K7Q2.{" "}
                            <button type="button">Copy</button>
                        </p>
                    ) : (
                        <label>
                            Name <input />
                        </label>
                    )}
                </Swap>
                {!made && <button type="submit">Create</button>}
            </form>
        </MotionProvider>
    );
}

/** Two views of one thing under a control that stays. */
function Project({ stepped = false }: { stepped?: boolean }) {
    const [facts, setFacts] = useState(false);
    return (
        <MotionProvider>
            <button type="button" onClick={() => setFacts(!facts)}>
                {facts ? "Show the cover" : "Show the facts"}
            </button>
            <Swap view={facts ? "facts" : "cover"} stepped={stepped}>
                {facts ? <p>Owner: Ada</p> : <p>The project's cover</p>}
            </Swap>
        </MotionProvider>
    );
}

/** The view a person reads, which holds the focus once it has arrived. */
const arrived = (text: string) => screen.getByText(text).parentElement;

it("takes the focus to the view that arrives when the act stood inside the view that left", async () => {
    const user = userEvent.setup();
    render(<Invitation />);
    await user.type(
        screen.getByRole("textbox", { name: "Name" }),
        "Ada{Enter}",
    );

    expect(arrived("The code is K7Q2.")).toHaveFocus();
    // The view is no stop of its own: Tab goes on into it.
    await user.tab();
    expect(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(arrived("The code is K7Q2.")).not.toHaveFocus();
});

it("takes the focus to the view that arrives when it is a step and the act beside it went with it", async () => {
    const user = userEvent.setup();
    render(<Invitation stepped />);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(arrived("The code is K7Q2.")).toHaveFocus();
});

it("leaves the focus where it was when the views are no steps", async () => {
    const user = userEvent.setup();
    render(<Invitation />);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(arrived("The code is K7Q2.")).not.toHaveFocus();
});

it("leaves the focus on the control that swaps the views and stays", async () => {
    const user = userEvent.setup();
    for (const stepped of [false, true]) {
        const project = render(<Project stepped={stepped} />);
        await user.click(
            screen.getByRole("button", { name: "Show the facts" }),
        );

        expect(
            screen.getByRole("button", { name: "Show the cover" }),
        ).toHaveFocus();
        project.unmount();
    }
});

it("makes the view that leaves inert and unread from its first frame of leaving", async () => {
    const user = userEvent.setup();
    render(<Project />);
    const leaving = arrived("The project's cover");
    const marked: (string | null)[] = [];
    const changes = new MutationObserver((records) => {
        for (const record of records) {
            if (record.target === leaving) marked.push(record.attributeName);
        }
    });
    changes.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["inert", "aria-hidden"],
    });

    await user.click(screen.getByRole("button", { name: "Show the facts" }));
    await act(() => Promise.resolve());

    changes.disconnect();
    expect(marked).toEqual(expect.arrayContaining(["inert", "aria-hidden"]));
    expect(leaving).not.toBeInTheDocument();
    expect(screen.queryByText("The project's cover")).toBeNull();
    expect(screen.getByText("Owner: Ada")).toBeInTheDocument();
});

afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById("bars")?.remove();
});

/**
 * Swaps to the code with every element's start at `top`, under bars that
 * leave a view a 100 px scroll margin, and says whether the view arriving
 * was brought into sight.
 */
async function arriveAt(top: number) {
    const bars = document.createElement("style");
    bars.id = "bars";
    bars.textContent = "[tabindex='-1'] { scroll-margin-top: 100px; }";
    document.head.append(bars);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        top,
    } as DOMRect);
    const shown = vi.spyOn(Element.prototype, "scrollIntoView");
    const user = userEvent.setup();
    render(<Invitation stepped />);
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(arrived("The code is K7Q2.")).toHaveFocus();
    return shown.mock.calls.length > 0;
}

it("brings the start of a view that arrives out from under the bars", async () => {
    expect(await arriveAt(40)).toBe(true);
});

it("leaves a view that arrives in sight below the bars where it is", async () => {
    expect(await arriveAt(140)).toBe(false);
});
