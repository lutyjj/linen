import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";

import { LinenProvider } from "../LinenProvider";
import { reactRouter } from "../navigation/react-router";
import { SectionNav } from "./SectionNav";

const SECTIONS = [
    { href: "/settings/profile", label: "Profile" },
    { href: "/settings/people", label: "People" },
];

function sections() {
    return within(screen.getByRole("navigation", { name: "Settings" }));
}

it("marks the section the router is on", () => {
    render(
        <LinenProvider navigation={reactRouter}>
            <MemoryRouter initialEntries={["/settings/people/7"]}>
                <SectionNav label="Settings" sections={SECTIONS} />
            </MemoryRouter>
        </LinenProvider>,
    );
    const people = sections().getByRole("link", { name: "People" });
    expect(people).toHaveAttribute("href", "/settings/people");
    expect(people).toHaveAttribute("aria-current", "page");
    expect(
        sections().getByRole("link", { name: "Profile" }),
    ).not.toHaveAttribute("aria-current");
});

it("marks the section of the page's own address where the app has no router", () => {
    window.history.pushState({}, "", "/settings/profile");
    try {
        render(<SectionNav label="Settings" sections={SECTIONS} />);
        expect(
            sections().getByRole("link", { name: "Profile" }),
        ).toHaveAttribute("aria-current", "page");
    } finally {
        window.history.pushState({}, "", "/");
    }
});
