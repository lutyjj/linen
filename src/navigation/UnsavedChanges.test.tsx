import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { LinenProvider } from "../LinenProvider";
import { Draft } from "../test/Draft";
import { memoryNavigation } from "../test/memoryNavigation";
import { UnsavedChangesGuard } from "./UnsavedChanges";

function setup(page: ReactNode) {
    const memory = memoryNavigation("/");
    const { Link } = memory.navigation;
    function Pages() {
        return memory.usePathname() === "/elsewhere" ? (
            <p>Another page</p>
        ) : (
            page
        );
    }
    render(
        <LinenProvider navigation={memory.navigation}>
            <UnsavedChangesGuard>
                <Link href="/elsewhere">Elsewhere</Link>
                <Link href="/">Back</Link>
                <Link href="/?sort=name">Sorted</Link>
                <Pages />
            </UnsavedChangesGuard>
        </LinenProvider>,
    );
    return { user: userEvent.setup(), memory };
}

const question = () =>
    screen.queryByRole("alertdialog", { name: "Leave without saving?" });

describe("leaving unsaved work", () => {
    it("moves on at once while every draft is saved", async () => {
        const { user, memory } = setup(<Draft name="the profile" />);
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(memory.address()).toBe("/elsewhere");
        expect(question()).toBeNull();
    });

    it("asks, names the unsaved drafts, and stays until told to leave", async () => {
        const { user, memory } = setup(
            <>
                <Draft name="the profile" />
                <Draft name="notifications" />
                <Draft name="the name" />
            </>,
        );
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        await user.type(
            screen.getByRole("textbox", { name: "notifications" }),
            "b",
        );
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(question()).toHaveTextContent(
            "Unsaved changes to the profile and notifications are lost.",
        );

        await user.click(screen.getByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(question()).toBeNull());
        expect(memory.address()).toBe("/");
        expect(
            screen.getByRole("textbox", { name: "notifications" }),
        ).toHaveValue("b");

        // Asked again after staying, and this time left.
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        await user.click(await screen.findByRole("button", { name: "Leave" }));
        expect(memory.address()).toBe("/elsewhere");
    });

    it("asks again on the next unsaved page after leaving one", async () => {
        const { user, memory } = setup(<Draft name="the profile" />);
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        await user.click(await screen.findByRole("button", { name: "Leave" }));
        await user.click(screen.getByRole("link", { name: "Back" }));
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "b",
        );
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        await user.click(await screen.findByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(question()).toBeNull());
        expect(memory.address()).toBe("/");
    });

    it("stays on the page without asking when only the query changes", async () => {
        const { user, memory } = setup(<Draft name="the profile" />);
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        await user.click(screen.getByRole("link", { name: "Sorted" }));
        expect(question()).toBeNull();
        expect(memory.address()).toBe("/?sort=name");
    });

    it("lets a navigation that holds nothing go on, with no blocker at all", () => {
        render(
            <LinenProvider
                navigation={{
                    ...memoryNavigation().navigation,
                    useBlocker: undefined,
                }}
            >
                <UnsavedChangesGuard>
                    <Draft name="the profile" />
                </UnsavedChangesGuard>
            </LinenProvider>,
        );
        expect(
            screen.getByRole("textbox", { name: "the profile" }),
        ).toBeInTheDocument();
    });

    it("forgets a draft once it is saved", async () => {
        const { user, memory } = setup(<Draft name="the profile" />);
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        await user.click(
            screen.getByRole("button", { name: "Save the profile" }),
        );
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(memory.address()).toBe("/elsewhere");
    });

    it("lets a draft whose save is under way move on, but not close the tab", async () => {
        const { user, memory } = setup(<Draft name="the screen" pending />);
        await user.type(
            screen.getByRole("textbox", { name: "the screen" }),
            "a",
        );
        const closing = new Event("beforeunload", { cancelable: true });
        act(() => {
            window.dispatchEvent(closing);
        });
        expect(closing.defaultPrevented).toBe(true);
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(memory.address()).toBe("/elsewhere");
    });

    it("lets the tab close when nothing is unsaved", () => {
        setup(<Draft name="the profile" />);
        const closing = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(closing);
        expect(closing.defaultPrevented).toBe(false);
    });
});

describe("leaving unsaved work where the app's links load pages", () => {
    it("leaves the question to the browser, which asks before the page goes", async () => {
        render(
            <LinenProvider>
                <UnsavedChangesGuard>
                    <a href="/elsewhere">Elsewhere</a>
                    <Draft name="the profile" />
                </UnsavedChangesGuard>
            </LinenProvider>,
        );
        await userEvent.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        const closing = new Event("beforeunload", { cancelable: true });
        act(() => {
            window.dispatchEvent(closing);
        });
        expect(closing.defaultPrevented).toBe(true);
        expect(question()).toBeNull();
    });
});
