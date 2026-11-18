import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it } from "vitest";

import { Conditions } from "../feedback/Conditions";
import { ENGLISH } from "../foundation/words";
import { LinenProvider } from "../LinenProvider";
import { memoryNavigation } from "../test/memoryNavigation";
import { TitleField, TopBar, TopBarLead } from "./TopBar";

it("names the screens above this one in a trail the title ends", () => {
    render(
        <>
            <TopBar
                title="Atlas"
                trail={[{ href: "/projects", label: "Projects" }]}
            />
        </>,
    );
    const trail = screen.getByRole("navigation", { name: ENGLISH.breadcrumb });
    expect(
        within(trail).getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("href", "/projects");
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent("Atlas");
    // The title follows the trail, as its last step.
    expect(
        trail.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
});

it("folds the steps before the nearest two behind one button", async () => {
    render(
        <>
            <TopBar
                title="Nightly export"
                trail={[
                    { href: "/settings", label: "Settings" },
                    { href: "/settings/integrations", label: "Integrations" },
                    {
                        href: "/settings/integrations/webhooks",
                        label: "Webhooks",
                    },
                ]}
            />
        </>,
    );
    const trail = screen.getByRole("navigation", { name: ENGLISH.breadcrumb });
    const shown = within(trail)
        .getAllByRole("link")
        .map((link) => link.textContent);
    expect(shown).toEqual(["Integrations", "Webhooks"]);

    await userEvent.click(
        within(trail).getByRole("button", { name: ENGLISH.foldedSteps }),
    );
    const folded = await screen.findByRole("dialog", {
        name: ENGLISH.foldedSteps,
    });
    expect(
        within(folded).getByRole("link", { name: "Settings" }),
    ).toHaveAttribute("href", "/settings");
});

it("closes the folded steps once one is chosen, where the screen stays", async () => {
    // One screen for every address, so the bar stays as the address changes.
    const memory = memoryNavigation("/d");
    function Place() {
        const place = memory.usePathname().slice(1);
        return (
            <TopBar
                title={place}
                trail={["a", "b", "c"].map((step) => ({
                    href: `/${step}`,
                    label: step.toUpperCase(),
                }))}
            />
        );
    }
    render(
        <LinenProvider navigation={memory.navigation}>
            <Place />
        </LinenProvider>,
    );
    const fold = screen.getByRole("button", { name: ENGLISH.foldedSteps });
    await userEvent.click(fold);
    const folded = await screen.findByRole("dialog", {
        name: ENGLISH.foldedSteps,
    });
    await userEvent.click(within(folded).getByRole("link", { name: "A" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("a");
    expect(fold).toHaveAttribute("aria-expanded", "false");
});

it("keeps the lead before a title whose trail is empty", () => {
    render(
        <>
            <TopBarLead value={<span>Acme</span>}>
                <TopBar title="Overview" trail={[]} />
            </TopBarLead>
        </>,
    );
    expect(
        screen.queryByRole("navigation", { name: ENGLISH.breadcrumb }),
    ).toBeNull();
    expect(screen.getByText("Acme")).toBeInTheDocument();
});

it("edits a title in place, as a field named for what it holds", async () => {
    function Editable() {
        const [name, setName] = useState("Quarterly");
        return (
            <TopBar
                title={
                    <TitleField
                        aria-label="Report name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                }
            />
        );
    }
    render(<Editable />);
    const field = screen.getByRole("textbox", { name: "Report name" });
    await userEvent.type(field, " report");
    expect(field).toHaveValue("Quarterly report");
    expect(screen.getByRole("heading", { level: 1 })).toContainElement(field);
});

it("marks itself a bar stuck to the page and says its height while it stands there", () => {
    const { unmount } = render(<TopBar title="Projects" />);
    const bar = screen.getByRole("banner");
    const place = bar.parentElement;
    // linen.css keeps what follows a marked bar clear of the bars.
    expect(bar).toHaveAttribute("data-sticky");
    expect(place?.style.getPropertyValue("--height-topbar")).not.toBe("");
    unmount();
    expect(place?.style.getPropertyValue("--height-topbar")).toBe("");
});

it("keeps its stack in a box that scrolls and holds nothing on the page clear of it", () => {
    render(
        <div style={{ overflowY: "auto" }}>
            <div>
                <Conditions
                    conditions={[{ id: "contact", title: "Contact is lost" }]}
                />
                <TopBar title="Projects" />
            </div>
        </div>,
    );
    const bar = screen.getByRole("banner");
    const conditions = screen.getByRole("status");
    // The top bar sticks beneath the conditions inside the box.
    expect(
        bar.parentElement?.style.getPropertyValue("--height-conditions"),
    ).not.toBe("");
    expect(
        bar.parentElement?.style.getPropertyValue("--height-topbar"),
    ).not.toBe("");
    expect(bar).not.toHaveAttribute("data-sticky");
    expect(conditions).not.toHaveAttribute("data-sticky");
});

it("keeps no room for actions that are nothing", () => {
    const { container, rerender } = render(<TopBar title="Reports" />);
    const bar = container.innerHTML;
    const editable = false as boolean;
    rerender(
        <TopBar title="Reports">
            {editable && <button type="button">Edit</button>}
        </TopBar>,
    );
    expect(container.innerHTML).toBe(bar);
});
