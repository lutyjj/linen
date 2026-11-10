import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { createMemoryRouter, Link, Outlet, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { UnsavedChangesGuard, useUnsavedChanges } from "./UnsavedChanges";
import { LinenProvider } from "./words";

/** A card of work kept with a save button, which a test types into. */
function Draft({ name, pending = false }: { name: string; pending?: boolean }) {
    const [value, setValue] = useState("");
    const [saved, setSaved] = useState("");
    useUnsavedChanges(value !== saved, { name, pending });
    return (
        <div>
            <label>
                {name}
                <input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
            </label>
            <button type="button" onClick={() => setSaved(value)}>
                Save {name}
            </button>
        </div>
    );
}

function setup(page: React.ReactNode) {
    const router = createMemoryRouter(
        [
            {
                element: (
                    <UnsavedChangesGuard>
                        <Link to="/elsewhere">Elsewhere</Link>
                        <Link to="/">Back</Link>
                        <Outlet />
                    </UnsavedChangesGuard>
                ),
                children: [
                    { path: "/", element: page },
                    { path: "/elsewhere", element: <p>Another page</p> },
                ],
            },
        ],
        { initialEntries: ["/"] },
    );
    render(
        <LinenProvider>
            <RouterProvider router={router} />
        </LinenProvider>,
    );
    return { user: userEvent.setup(), router };
}

const question = () =>
    screen.queryByRole("dialog", { name: "Leave without saving?" });

describe("leaving unsaved work", () => {
    it("moves on at once while every draft is saved", async () => {
        const { user, router } = setup(<Draft name="the profile" />);
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(router.state.location.pathname).toBe("/elsewhere");
        expect(question()).toBeNull();
    });

    it("asks, names the unsaved drafts, and stays until told to leave", async () => {
        const { user, router } = setup(
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
        expect(router.state.location.pathname).toBe("/");
        expect(
            screen.getByRole("textbox", { name: "notifications" }),
        ).toHaveValue("b");

        // Asked again after staying, and this time left.
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        await user.click(await screen.findByRole("button", { name: "Leave" }));
        expect(router.state.location.pathname).toBe("/elsewhere");
    });

    it("asks again on the next unsaved page after leaving one", async () => {
        const { user, router } = setup(<Draft name="the profile" />);
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
        expect(router.state.location.pathname).toBe("/");
    });

    it("forgets a draft once it is saved", async () => {
        const { user, router } = setup(<Draft name="the profile" />);
        await user.type(
            screen.getByRole("textbox", { name: "the profile" }),
            "a",
        );
        await user.click(
            screen.getByRole("button", { name: "Save the profile" }),
        );
        await user.click(screen.getByRole("link", { name: "Elsewhere" }));
        expect(router.state.location.pathname).toBe("/elsewhere");
    });

    it("lets a draft whose save is under way move on, but not close the tab", async () => {
        const { user, router } = setup(<Draft name="the screen" pending />);
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
        expect(router.state.location.pathname).toBe("/elsewhere");
    });

    it("lets the tab close when nothing is unsaved", () => {
        setup(<Draft name="the profile" />);
        const closing = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(closing);
        expect(closing.defaultPrevented).toBe(false);
    });
});
