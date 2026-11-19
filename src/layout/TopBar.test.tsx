import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";

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
    // The title follows the trail in the bar, as its last step.
    expect(screen.getByRole("banner")).toContainElement(trail);
    expect(
        trail.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
});

it("shows two steps, and folds the outer ones behind one button from three", async () => {
    const { unmount } = render(
        <TopBar
            title="Webhooks"
            trail={[
                { href: "/settings", label: "Settings" },
                { href: "/settings/integrations", label: "Integrations" },
            ]}
        />,
    );
    const two = screen.getByRole("navigation", { name: ENGLISH.breadcrumb });
    expect(
        within(two)
            .getAllByRole("link")
            .map((link) => link.textContent),
    ).toEqual(["Settings", "Integrations"]);
    expect(
        within(two).queryByRole("button", { name: ENGLISH.foldedSteps }),
    ).toBeNull();
    unmount();

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
    expect(shown).toEqual(["Webhooks"]);

    await userEvent.click(
        within(trail).getByRole("button", { name: ENGLISH.foldedSteps }),
    );
    const folded = await screen.findByRole("dialog", {
        name: ENGLISH.foldedSteps,
    });
    expect(
        within(folded)
            .getAllByRole("link")
            .map((link) => link.getAttribute("href")),
    ).toEqual(["/settings", "/settings/integrations"]);
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

it("leads up a level from where the lead stands, named for the screen above", () => {
    render(
        <>
            <TopBarLead value={<span>Acme</span>}>
                <TopBar
                    title="Atlas"
                    trail={[{ href: "/projects", label: "Projects" }]}
                />
            </TopBarLead>
        </>,
    );
    const trail = screen.getByRole("navigation", { name: ENGLISH.breadcrumb });
    // A phone's way up stands outside the trail, before the title, and the
    // lead gives it its place.
    const back = screen
        .getAllByRole("link", { name: "Projects" })
        .find((link) => !trail.contains(link));
    expect(back).toHaveAttribute("href", "/projects");
    const title = screen.getByRole("heading", { level: 1 });
    expect(
        (back?.compareDocumentPosition(title) ?? 0) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("Acme")).toBeNull();
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

it("keeps saying its height while another top bar stands in its place, as the next screen's does while this one leaves", () => {
    function Screens({ shown }: { shown: readonly string[] }) {
        return (
            <main>
                {shown.map((title) => (
                    <TopBar key={title} title={title} />
                ))}
            </main>
        );
    }
    const { rerender } = render(<Screens shown={["Projects", "Reports"]} />);
    const place = screen.getByRole("main");
    rerender(<Screens shown={["Reports"]} />);
    expect(place.style.getPropertyValue("--height-topbar")).toBe("0px");
    rerender(<Screens shown={[]} />);
    expect(place.style.getPropertyValue("--height-topbar")).toBe("");
});

/** A top bar 49 px tall, a box that scrolls with two rows, and a control after it. */
function renderBox() {
    const view = render(
        <>
            <TopBar title="Exports" />
            <div data-scroll-box>
                <button type="button">First</button>
                <button type="button">Second</button>
            </div>
            <button type="button">Elsewhere</button>
        </>,
    );
    // jsdom lays nothing out: the bar is given its height here.
    Object.defineProperty(screen.getByRole("banner"), "offsetHeight", {
        value: 49,
    });
    return view;
}

it("holds the bars' room as the page's scroll padding while the focus is inside a box that scrolls", () => {
    const { unmount } = renderBox();
    const root = document.documentElement;
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    expect(root.style.scrollPaddingTop).toBe("");
    screen.getByRole("button", { name: "First" }).focus();
    expect(root.style.scrollPaddingTop).toBe("49px");
    screen.getByRole("button", { name: "Second" }).focus();
    expect(root.style.scrollPaddingTop).toBe("49px");
    screen.getByRole("button", { name: "Second" }).blur();
    expect(root.style.scrollPaddingTop).toBe("");
    screen.getByRole("button", { name: "First" }).focus();
    unmount();
    expect(root.style.scrollPaddingTop).toBe("");
});

it("brings each stop the Tab key moves to in a box into view from where the key found it, and leaves any other focus as it came", async () => {
    renderBox();
    const box = screen.getByRole("button", { name: "First" }).parentElement!;
    const shown = vi.spyOn(Element.prototype, "scrollIntoView");
    screen
        .getByRole("button", { name: "First" })
        .focus({ preventScroll: true });
    expect(shown).not.toHaveBeenCalled();
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    // The browser scrolls to where the key goes as the key is pressed, as
    // Chromium does, here to the middle of the box.
    box.scrollTop = 30;
    const centre = ({ key }: KeyboardEvent) => {
        if (key === "Tab") box.scrollTop = 99;
    };
    document.addEventListener("keydown", centre);
    await userEvent.tab({ shift: true });
    expect(box.scrollTop).toBe(30);
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    expect(box.scrollTop).toBe(30);
    expect(shown.mock.contexts).toEqual([
        screen.getByRole("button", { name: "Second" }),
        screen.getByRole("button", { name: "First" }),
    ]);
    expect(shown).toHaveBeenCalledWith({ block: "nearest" });
    document.removeEventListener("keydown", centre);
    shown.mockRestore();
});

it("leaves a focus as it came where a script takes the Tab key itself", async () => {
    renderBox();
    const shown = vi.spyOn(Element.prototype, "scrollIntoView");
    const first = screen.getByRole("button", { name: "First" });
    const own = (press: KeyboardEvent) => {
        if (press.key !== "Tab") return;
        press.preventDefault();
        first.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", own);
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    await userEvent.tab();
    expect(first).toHaveFocus();
    expect(shown).not.toHaveBeenCalled();
    document.removeEventListener("keydown", own);
    shown.mockRestore();
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
