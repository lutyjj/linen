import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * A guide whose step is taken in a layer above the page, as a confirmation
 * is, drawn into the body as one is. The layer's button moves the step on
 * while the layer stays open; the app then takes the layer away, at once or
 * after a leave in which it is inert, as linen's dialogs and popups leave,
 * or the layer goes on to its next view, which has a button of its own.
 */
function Guide({
    layer,
    stepped = true,
}: {
    layer: "open" | "next" | "leaving" | "gone";
    stepped?: boolean;
}) {
    const [step, setStep] = useState(1);
    return (
        <MotionProvider>
            <Swap view={`step ${step}`} stepped={stepped}>
                <p>Step {step} of the guide</p>
            </Swap>
            <button type="button">Elsewhere</button>
            {layer !== "gone" &&
                createPortal(
                    <div
                        role="dialog"
                        aria-label="Go on?"
                        inert={layer === "leaving"}
                    >
                        {layer === "next" ? (
                            <button key="done" type="button">
                                Done
                            </button>
                        ) : (
                            <button
                                key="go on"
                                type="button"
                                onClick={() => setStep(step + 1)}
                            >
                                Go on
                            </button>
                        )}
                    </div>,
                    document.body,
                )}
        </MotionProvider>
    );
}

/** A guide stepped from a toolbar beside it, which the app can take away. */
function Toolbar() {
    const [step, setStep] = useState(1);
    const [shown, setShown] = useState(true);
    return (
        <MotionProvider>
            {shown && (
                <div role="toolbar" aria-label="Guide">
                    <button type="button" onClick={() => setStep(step + 1)}>
                        Next
                    </button>
                    <button type="button" onClick={() => setShown(false)}>
                        Hide the toolbar
                    </button>
                </div>
            )}
            <Swap view={`step ${step}`} stepped>
                <p>Step {step} of the guide</p>
            </Swap>
        </MotionProvider>
    );
}

/** A setup in a layer whose last step closes it, inert as it leaves. */
function Setup() {
    const [step, setStep] = useState(1);
    const [leaving, setLeaving] = useState(false);
    return (
        <MotionProvider>
            <div role="dialog" aria-label="Setup" inert={leaving}>
                <Swap view={`step ${step}`} stepped>
                    <p>Step {step} of the setup</p>
                </Swap>
                <button
                    type="button"
                    onClick={() => {
                        setStep(step + 1);
                        setLeaving(true);
                    }}
                >
                    Done
                </button>
            </div>
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

for (const leave of ["leaving", "gone"] as const) {
    it(`takes the focus to a step that arrives while the focus is in a layer once the layer is ${leave}`, async () => {
        const user = userEvent.setup();
        const guide = render(<Guide layer="open" />);
        await user.click(screen.getByRole("button", { name: "Go on" }));

        // Nothing is taken from a layer still open.
        expect(screen.getByRole("button", { name: "Go on" })).toHaveFocus();
        guide.rerender(<Guide layer={leave} />);
        await act(() => Promise.resolve());

        expect(arrived("Step 2 of the guide")).toHaveFocus();
    });
}

it("leaves the focus to a layer that stays open as the button that held it goes", async () => {
    const user = userEvent.setup();
    const guide = render(<Guide layer="open" />);
    await user.click(screen.getByRole("button", { name: "Go on" }));
    guide.rerender(<Guide layer="next" />);
    await act(() => Promise.resolve());

    expect(arrived("Step 2 of the guide")).not.toHaveFocus();
});

it("leaves the focus where the person put it while the layer was open", async () => {
    const user = userEvent.setup();
    const guide = render(<Guide layer="open" />);
    await user.click(screen.getByRole("button", { name: "Go on" }));
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    guide.rerender(<Guide layer="gone" />);
    await act(() => Promise.resolve());

    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
});

it("takes no focus a layer held when the views are no steps", async () => {
    const user = userEvent.setup();
    const guide = render(<Guide layer="open" stepped={false} />);
    await user.click(screen.getByRole("button", { name: "Go on" }));
    guide.rerender(<Guide layer="gone" stepped={false} />);
    await act(() => Promise.resolve());

    expect(arrived("Step 2 of the guide")).not.toHaveFocus();
});

it("stops waiting for the layer once the views are no longer steps", async () => {
    const user = userEvent.setup();
    const guide = render(<Guide layer="open" />);
    await user.click(screen.getByRole("button", { name: "Go on" }));
    guide.rerender(<Guide layer="open" stepped={false} />);
    guide.rerender(<Guide layer="gone" stepped={false} />);
    await act(() => Promise.resolve());

    expect(arrived("Step 2 of the guide")).not.toHaveFocus();
});

it("leaves the focus on a control of the page that keeps it, whatever goes later", async () => {
    const user = userEvent.setup();
    render(<Toolbar />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Hide the toolbar" }));
    await act(() => Promise.resolve());

    expect(screen.queryByRole("toolbar")).toBeNull();
    expect(arrived("Step 2 of the guide")).not.toHaveFocus();
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

it("neither focuses nor brings into sight a step that arrives in a layer on its way out", async () => {
    const bars = document.createElement("style");
    bars.id = "bars";
    bars.textContent = "[tabindex='-1'] { scroll-margin-top: 100px; }";
    document.head.append(bars);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        top: 40,
    } as DOMRect);
    const shown = vi.spyOn(Element.prototype, "scrollIntoView");
    const user = userEvent.setup();
    render(<Setup />);
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(arrived("Step 2 of the setup")).not.toHaveFocus();
    expect(shown).not.toHaveBeenCalled();
});
