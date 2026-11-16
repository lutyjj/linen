import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder, Sun, Users } from "lucide-react";
import { afterEach, expect, it, vi } from "vitest";

import { SegmentedControl } from "../../controls/SegmentedControl";
import { ENGLISH } from "../../foundation/words";
import { LinenProvider } from "../../LinenProvider";
import { memoryNavigation } from "../../test/memoryNavigation";
import { AccountMenu } from "./AccountMenu";
import { RailChoice } from "./Rail";
import { Shell } from "./Shell";

afterEach(() => vi.restoreAllMocks());

const HOME = { href: "/", label: "linen" };

function frame() {
    return render(
        <LinenProvider navigation={memoryNavigation().navigation}>
            <Shell
                label="Places"
                places={[{ href: "/", label: "Projects", icon: Folder }]}
                home={HOME}
                wordmark="linen"
                storageKey="test:rail"
            >
                <p>The screen</p>
            </Shell>
        </LinenProvider>,
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
        <LinenProvider navigation={memoryNavigation("/people").navigation}>
            <Shell
                label="Places"
                places={[
                    {
                        href: "/",
                        label: "Projects",
                        icon: Folder,
                        exact: true,
                    },
                    { href: "/people", label: "People", icon: Users },
                ]}
                home={HOME}
                wordmark="linen"
                storageKey="test:rail"
                phoneNav="top"
            >
                <p>The screen</p>
            </Shell>
        </LinenProvider>,
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
        { href: "/", label: "Projects", icon: Folder, exact: true },
        { href: "/people", label: "People", icon: Users },
    ];
    const at = (folded: boolean) => (
        <LinenProvider navigation={memoryNavigation("/people/7").navigation}>
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
        </LinenProvider>
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

it("marks the current place from the page's own address where the app has no router", () => {
    window.history.pushState({}, "", "/people/7");
    try {
        render(
            <Shell
                label="Places"
                places={[
                    { href: "/", label: "Projects", icon: Folder },
                    { href: "/people", label: "People", icon: Users },
                ]}
                home={HOME}
                wordmark="linen"
                storageKey="test:rail"
            >
                <p>The screen</p>
            </Shell>,
        );
        const rail = screen.getAllByRole("navigation", { name: "Places" })[0];
        if (rail === undefined) throw new Error("no rail");
        const people = within(rail).getByRole("link", { name: "People" });
        expect(people).toHaveAttribute("href", "/people");
        expect(people).toHaveAttribute("aria-current", "page");
        // The root is current only on its own address.
        expect(
            within(rail).getByRole("link", { name: "Projects" }),
        ).not.toHaveAttribute("aria-current");
    } finally {
        window.history.pushState({}, "", "/");
    }
});

it("puts the rail's foot at the end of a phone's bar, top or bottom", () => {
    const foot = (
        <AccountMenu name="Ada" label="Ada's account" menuLabel="Account" />
    );
    const at = (phoneNav: "top" | "bottom") => (
        <Shell
            label="Places"
            places={[{ href: "/", label: "Projects", icon: Folder }]}
            home={HOME}
            wordmark="linen"
            storageKey="test:rail"
            phoneNav={phoneNav}
            foot={foot}
        >
            <p>The screen</p>
        </Shell>
    );
    const view = render(at("bottom"));
    const tabs = document.querySelector<HTMLElement>("[data-tab-bar]");
    if (tabs === null) throw new Error("no tab bar");
    expect(
        within(tabs).getByRole("button", { name: "Ada's account" }),
    ).toBeInTheDocument();

    view.rerender(at("top"));
    const [, top] = screen.getAllByRole("navigation", { name: "Places" });
    if (top === undefined) throw new Error("no phone navigation");
    expect(
        within(top).getByRole("button", { name: "Ada's account" }),
    ).toBeInTheDocument();
});

it("opens a choice in the foot from each phone bar, under the choice's name", async () => {
    const foot = (
        <RailChoice icon={Sun} label="Theme">
            <SegmentedControl
                label="Theme"
                value="light"
                options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                ]}
                onValueChange={() => undefined}
            />
        </RailChoice>
    );
    const at = (phoneNav: "top" | "bottom") => (
        <Shell
            label="Places"
            places={[{ href: "/", label: "Projects", icon: Folder }]}
            home={HOME}
            wordmark="linen"
            storageKey="test:rail"
            phoneNav={phoneNav}
            foot={foot}
        >
            <p>The screen</p>
        </Shell>
    );
    const opens = async (bar: HTMLElement) => {
        const trigger = within(bar).getByRole("button", { name: "Theme" });
        // Named as a place is, not by a folded rail's tip, which only a
        // resting pointer or the keyboard shows (motion.css's rail-tip).
        expect(trigger.querySelector(".rail-tip")).toBeNull();
        await userEvent.click(trigger);
        const choice = await screen.findByRole("dialog", { name: "Theme" });
        expect(
            within(choice).getByRole("heading", { name: "Theme" }),
        ).toBeInTheDocument();
        expect(
            within(choice).getByRole("radio", { name: "Light" }),
        ).toBeChecked();
        await userEvent.keyboard("{Escape}");
    };

    const view = render(at("bottom"));
    const tabs = document.querySelector<HTMLElement>("[data-tab-bar]");
    if (tabs === null) throw new Error("no tab bar");
    await opens(tabs);

    view.rerender(at("top"));
    const [, top] = screen.getAllByRole("navigation", { name: "Places" });
    if (top === undefined) throw new Error("no phone navigation");
    await opens(top);
});
