import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder, Sun, Users } from "lucide-react";
import { afterEach, expect, it, vi } from "vitest";

import { SegmentedControl } from "../../controls/SegmentedControl";
import { ENGLISH } from "../../foundation/words";
import { LinenProvider } from "../../LinenProvider";
import { markup } from "../../test/markup";
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

it("keeps the rail's foot out of a phone's bar, top or bottom", () => {
    const foot = (
        <>
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
            <AccountMenu name="Ada" label="Ada's account" menuLabel="Account" />
        </>
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
    const holdsPlacesAlone = (bar: HTMLElement) => {
        expect(
            within(bar).getByRole("link", { name: "Projects" }),
        ).toBeInTheDocument();
        expect(within(bar).queryByRole("button")).toBeNull();
        expect(within(bar).queryByRole("radiogroup")).toBeNull();
    };
    // The rail holds the foot, once.
    const railHoldsFoot = () => {
        expect(
            screen.getByRole("button", { name: "Ada's account" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("radiogroup", { name: "Theme" }),
        ).toBeInTheDocument();
    };

    const view = render(at("bottom"));
    const tabs = document.querySelector<HTMLElement>("[data-tab-bar]");
    if (tabs === null) throw new Error("no tab bar");
    holdsPlacesAlone(tabs);
    railHoldsFoot();

    view.rerender(at("top"));
    const [, top] = screen.getAllByRole("navigation", { name: "Places" });
    if (top === undefined) throw new Error("no phone navigation");
    holdsPlacesAlone(top);
    railHoldsFoot();
});

it("opens a choice of the folded rail under the choice's name", async () => {
    render(
        <Shell
            label="Places"
            places={[{ href: "/", label: "Projects", icon: Folder }]}
            home={HOME}
            wordmark="linen"
            storageKey="test:rail"
            folded
            foot={
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
            }
        >
            <p>The screen</p>
        </Shell>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Theme" }));
    const choice = await screen.findByRole("dialog", { name: "Theme" });
    expect(
        within(choice).getByRole("heading", { name: "Theme" }),
    ).toBeInTheDocument();
    expect(within(choice).getByRole("radio", { name: "Light" })).toBeChecked();
});

it("draws a rail whose head, foot or mark is nothing as one without them", () => {
    const at = (nothing?: false) => (
        <LinenProvider navigation={memoryNavigation().navigation}>
            <Shell
                label="Places"
                places={[{ href: "/", label: "Projects", icon: Folder }]}
                home={HOME}
                wordmark="linen"
                mark={nothing}
                head={nothing}
                foot={nothing}
                storageKey="test:rail"
                folded
            >
                <p>The screen</p>
            </Shell>
        </LinenProvider>
    );
    const { container, rerender } = render(at());
    const shell = markup(container);
    rerender(at(false));
    expect(markup(container)).toBe(shell);
});

it("opens an account menu whose caption, choices or way out are nothing as one without them", async () => {
    const user = userEvent.setup();
    const menu = async (nothing?: false) => {
        const view = render(
            <AccountMenu
                name="Ada"
                label="Ada's account"
                menuLabel="Account"
                caption={nothing}
                footer={nothing}
            >
                {nothing}
            </AccountMenu>,
        );
        await user.click(screen.getByRole("button", { name: "Ada's account" }));
        // What the menu holds; the popup's own state moves as it opens.
        const popup = await screen.findByRole("dialog", { name: "Account" });
        const drawn = [...popup.children].map(markup).join("");
        view.unmount();
        return drawn;
    };
    expect(await menu(false)).toBe(await menu());
});
