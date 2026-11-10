import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder, Users } from "lucide-react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";

import { Shell } from "./Shell";
import { ENGLISH } from "./words";

afterEach(() => vi.restoreAllMocks());

const HOME = { to: "/", label: "linen" };

function frame() {
    return render(
        <MemoryRouter>
            <Shell
                label="Places"
                places={[{ to: "/", label: "Projects", icon: Folder }]}
                home={HOME}
                wordmark="linen"
                storageKey="test:rail"
            >
                <p>The screen</p>
            </Shell>
        </MemoryRouter>,
    );
}

it("keeps the fold for the page where the browser refuses storage", async () => {
    const refused = () => {
        throw new DOMException("refused", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(refused);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(refused);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(refused);

    frame();
    expect(screen.getByText("The screen")).toBeInTheDocument();

    await userEvent.click(
        screen.getByRole("button", { name: ENGLISH.collapseRail }),
    );
    expect(
        screen.getByRole("button", { name: ENGLISH.expandRail }),
    ).toBeInTheDocument();
});

it("shows a phone's places along the top, each still named, and no tab bar", () => {
    render(
        <MemoryRouter initialEntries={["/people"]}>
            <Shell
                label="Places"
                places={[
                    { to: "/", label: "Projects", icon: Folder, exact: true },
                    { to: "/people", label: "People", icon: Users },
                ]}
                home={HOME}
                wordmark="linen"
                storageKey="test:rail"
                phoneNav="top"
            >
                <p>The screen</p>
            </Shell>
        </MemoryRouter>,
    );

    // The rail comes first, then the phone's bar.
    const top = screen.getAllByRole("navigation", { name: "Places" })[1];
    if (top === undefined) throw new Error("no phone navigation");
    expect(within(top).getByText("linen")).toBeInTheDocument();
    expect(within(top).getByRole("link", { name: "People" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    expect(
        within(top).getByRole("link", { name: "Projects" }),
    ).not.toHaveAttribute("aria-current");
    // linen.css lifts toasts above the tab bar only while one is on the page.
    expect(document.querySelector("[data-tab-bar]")).toBeNull();
    // Read where it stands: before the screen.
    expect(
        top.compareDocumentPosition(screen.getByRole("main")) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
});

it("puts a phone's places in the tab bar unless the app chooses the top", () => {
    frame();
    const tabs = document.querySelector("[data-tab-bar]");
    expect(tabs).not.toBeNull();
    expect(
        within(tabs as HTMLElement).getByRole("link", { name: "Projects" }),
    ).toBeInTheDocument();
    // Read where it stands: after the screen, at its foot.
    expect(
        screen.getByRole("main").compareDocumentPosition(tabs as Node) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
});

it("leads home from the wordmark, and from the mark of a rail the screen folded", () => {
    const places = [
        { to: "/", label: "Projects", icon: Folder, exact: true },
        { to: "/people", label: "People", icon: Users },
    ];
    const at = (folded: boolean) => (
        <MemoryRouter initialEntries={["/people/7"]}>
            <Shell
                label="Places"
                places={places}
                home={HOME}
                wordmark="linen"
                mark={<svg aria-hidden="true" />}
                storageKey="test:rail"
                phoneNav="top"
                folded={folded}
            >
                <p>The screen</p>
            </Shell>
        </MemoryRouter>
    );
    const view = render(at(false));
    const [rail, top] = screen.getAllByRole("navigation", { name: "Places" });
    for (const nav of [rail, top]) {
        if (nav === undefined) throw new Error("no navigation");
        expect(
            within(nav).getByRole("link", { name: "linen" }),
        ).toHaveAttribute("href", "/");
    }

    view.rerender(at(true));
    const folded = screen.getAllByRole("navigation", { name: "Places" })[0];
    if (folded === undefined) throw new Error("no rail");
    expect(within(folded).getByRole("link", { name: "linen" })).toHaveAttribute(
        "href",
        "/",
    );
});
