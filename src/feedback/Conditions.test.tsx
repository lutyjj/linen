import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder } from "lucide-react";
import { expect, it } from "vitest";

import { Shell } from "../layout/shell/Shell";
import { TopBar } from "../layout/TopBar";
import { Conditions } from "./Conditions";
import { Elapsed } from "./Elapsed";

it("stands a failure first, then a warning, then what is under way", () => {
    render(
        <Conditions
            conditions={[
                {
                    id: "update",
                    tone: "accent",
                    title: "Updating",
                    active: true,
                },
                { id: "battery", tone: "warn", title: "Running on battery" },
                { id: "contact", tone: "danger", title: "Contact is lost" },
                { id: "sync", title: "Syncing" },
            ]}
        />,
    );
    expect(
        [...screen.getByRole("status").children].map((one) => one.textContent),
    ).toEqual(["Contact is lost", "Running on battery", "Updating", "Syncing"]);
});

it("keeps focus in a condition while one before it ends", async () => {
    function Standing({ updating }: { updating: boolean }) {
        return (
            <Conditions
                conditions={[
                    ...(updating
                        ? [
                              {
                                  id: "contact",
                                  tone: "danger" as const,
                                  title: "Contact is lost",
                              },
                          ]
                        : []),
                    {
                        id: "battery",
                        tone: "warn",
                        title: "Running on battery",
                        action: <button type="button">Plug in</button>,
                    },
                ]}
            />
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
    const { rerender } = render(<Conditions conditions={[]} />);
    const place = screen.getByRole("status");
    expect(place).toBeEmptyDOMElement();

    rerender(
        <Conditions
            conditions={[
                { id: "contact", tone: "danger", title: "Contact is lost" },
            ]}
        />,
    );
    expect(screen.getByRole("status")).toBe(place);
    expect(place).toHaveTextContent("Contact is lost");
});

it("counts how long a condition has held as a timer, which is not read out", () => {
    render(
        <Conditions
            conditions={[
                {
                    id: "export",
                    active: true,
                    title: "Exporting",
                    description: <Elapsed since={Date.now()} />,
                },
            ]}
        />,
    );
    // A timer is a live region of its own that is off, inside the polite one.
    expect(
        within(screen.getByRole("status")).getByRole("timer"),
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
            conditions={[
                { id: "contact", tone: "danger", title: "Contact is lost" },
            ]}
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
    // linen.css keeps what follows a marked bar clear of the bars.
    expect(within(main).getByRole("status")).toHaveAttribute("data-sticky");
});

it("draws a condition whose description or action is nothing as one without them", () => {
    const title = "Read only while storage is nearly full.";
    const { container, rerender } = render(
        <Conditions conditions={[{ id: "storage", title }]} />,
    );
    const band = container.innerHTML;
    rerender(
        <Conditions
            conditions={[
                { id: "storage", title, description: "", action: false },
            ]}
        />,
    );
    expect(container.innerHTML).toBe(band);
});
