import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder } from "lucide-react";
import { expect, it } from "vitest";

import { Shell } from "../layout/shell/Shell";
import { TopBar } from "../layout/TopBar";
import { Condition, Conditions } from "./Conditions";
import { Elapsed } from "./Elapsed";

it("stands a failure first, then a warning, then what is under way", () => {
    render(
        <Conditions>
            <Condition tone="accent" title="Updating" active />
            <Condition tone="warn" title="Running on battery" />
            <Condition tone="danger" title="Contact is lost" />
        </Conditions>,
    );
    const standing = screen.getByRole("status");
    expect(
        [...standing.children].map((condition) => condition.textContent),
    ).toEqual(["Contact is lost", "Running on battery", "Updating"]);
});

it("orders conditions an app groups in fragments", () => {
    render(
        <Conditions>
            <>
                <Condition tone="warn" title="Running on battery" />
                {null}
            </>
            <>
                <Condition tone="danger" title="Contact is lost" />
            </>
        </Conditions>,
    );
    expect(
        [...screen.getByRole("status").children].map((one) => one.textContent),
    ).toEqual(["Contact is lost", "Running on battery"]);
});

it("keeps every condition from fragments and siblings apart", () => {
    render(
        <Conditions>
            <>
                <Condition tone="accent" title="Updating" />
                <Condition tone="warn" title="Running on battery" />
            </>
            <Condition tone="danger" title="Contact is lost" />
        </Conditions>,
    );
    expect(
        [...screen.getByRole("status").children].map((one) => one.textContent),
    ).toEqual(["Contact is lost", "Running on battery", "Updating"]);
});

it("takes conditions given in any list, as React takes children", () => {
    render(
        <Conditions>
            {
                new Set([
                    <Condition
                        key="battery"
                        tone="warn"
                        title="Running on battery"
                    />,
                    <Condition
                        key="contact"
                        tone="danger"
                        title="Contact is lost"
                    />,
                ])
            }
        </Conditions>,
    );
    expect(
        [...screen.getByRole("status").children].map((one) => one.textContent),
    ).toEqual(["Contact is lost", "Running on battery"]);
});

it("keeps focus in a condition while one before it ends", async () => {
    function Standing({ updating }: { updating: boolean }) {
        return (
            <Conditions>
                <>
                    {updating && <Condition tone="accent" title="Updating" />}
                    <Condition
                        tone="warn"
                        title="Running on battery"
                        action={<button type="button">Plug in</button>}
                    />
                </>
                <Condition tone="danger" title="Contact is lost" />
            </Conditions>
        );
    }
    const { rerender } = render(<Standing updating />);
    const plugIn = screen.getByRole("button", { name: "Plug in" });
    await userEvent.click(plugIn);
    expect(plugIn).toHaveFocus();

    rerender(<Standing updating={false} />);
    expect(screen.getByRole("button", { name: "Plug in" })).toBe(plugIn);
    expect(plugIn).toHaveFocus();
});

it("keeps its place, said politely, while nothing holds", () => {
    const { rerender } = render(<Conditions>{false}</Conditions>);
    const place = screen.getByRole("status");
    expect(place).toBeEmptyDOMElement();

    rerender(
        <Conditions>
            <Condition tone="danger" title="Contact is lost" />
        </Conditions>,
    );
    expect(screen.getByRole("status")).toBe(place);
    expect(place).toHaveTextContent("Contact is lost");
});

it("counts how long a condition has held as a timer, which is not read out", () => {
    render(
        <Conditions>
            <Condition
                tone="accent"
                active
                title="Exporting"
                description={<Elapsed since={Date.now()} />}
            />
        </Conditions>,
    );
    // A timer is a live region of its own that is off, inside the polite one.
    expect(
        within(screen.getByRole("status")).getByRole("timer"),
    ).toBeInTheDocument();
});

it("offers each condition's own action", () => {
    render(
        <Conditions>
            <Condition
                tone="danger"
                title="Contact is lost"
                action={<button type="button">Try again</button>}
            />
        </Conditions>,
    );
    expect(
        within(screen.getByRole("status")).getByRole("button", {
            name: "Try again",
        }),
    ).toBeInTheDocument();
});

it("stands in the shell over every screen's top bar", () => {
    render(
        <Shell
            label="Places"
            places={[{ href: "/", label: "Projects", icon: Folder }]}
            home={{ href: "/", label: "Example" }}
            wordmark="Example"
            storageKey="test:rail"
            conditions={<Condition tone="danger" title="Contact is lost" />}
        >
            <TopBar title="Projects" />
        </Shell>,
    );
    const main = screen.getByRole("main");
    const condition = within(main).getByText("Contact is lost");
    const bar = within(main).getByRole("banner");
    expect(
        condition.compareDocumentPosition(bar) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The top bar sticks beneath the conditions, which say how tall they are.
    expect(main.style.getPropertyValue("--height-conditions")).not.toBe("");
});
