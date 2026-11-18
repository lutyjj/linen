import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { LinenProvider } from "../LinenProvider";
import { memoryNavigation } from "../test/memoryNavigation";
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
        <LinenProvider
            navigation={memoryNavigation("/settings/people/7").navigation}
        >
            <SectionNav label="Settings" sections={SECTIONS} />
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

it("marks itself a bar stuck to the page and says its height while it stands there", () => {
    const { unmount } = render(
        <LinenProvider
            navigation={memoryNavigation("/settings/people").navigation}
        >
            <SectionNav label="Settings" sections={SECTIONS} />
        </LinenProvider>,
    );
    const rail = screen.getByRole("navigation", { name: "Settings" });
    const place = rail.parentElement;
    // linen.css keeps what follows a marked bar clear of the bars.
    expect(rail).toHaveAttribute("data-sticky");
    expect(place?.style.getPropertyValue("--height-sectionnav")).not.toBe("");
    unmount();
    expect(place?.style.getPropertyValue("--height-sectionnav")).toBe("");
});
