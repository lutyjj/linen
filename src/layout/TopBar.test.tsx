import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import { expect, it } from "vitest";

import { ENGLISH } from "../foundation/words";
import { LinenProvider } from "../LinenProvider";
import { reactRouter } from "../navigation/react-router";
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
    expect(
        await screen.findByRole("menuitem", { name: "Settings" }),
    ).toHaveAttribute("href", "/settings");
});

it("closes the folded steps once one is chosen, where the screen stays", async () => {
    // One screen for every address, so the bar stays as the route changes.
    function Place() {
        const { place = "" } = useParams();
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
        <LinenProvider navigation={reactRouter}>
            <MemoryRouter initialEntries={["/d"]}>
                <Routes>
                    <Route path="/:place" element={<Place />} />
                </Routes>
            </MemoryRouter>
        </LinenProvider>,
    );
    const fold = screen.getByRole("button", { name: ENGLISH.foldedSteps });
    await userEvent.click(fold);
    await userEvent.click(await screen.findByRole("menuitem", { name: "A" }));
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
