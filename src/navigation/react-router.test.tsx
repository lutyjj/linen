import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    createMemoryRouter,
    Link,
    MemoryRouter,
    Outlet,
    RouterProvider,
} from "react-router";
import { expect, it } from "vitest";

import { SectionNav } from "../layout/SectionNav";
import { LinenProvider } from "../LinenProvider";
import { Draft } from "../test/Draft";
import { reactRouter } from "./react-router";
import { UnsavedChangesGuard } from "./UnsavedChanges";

it("moves through React Router, and marks the place it is on", async () => {
    render(
        <LinenProvider navigation={reactRouter}>
            <MemoryRouter initialEntries={["/settings/profile"]}>
                <SectionNav
                    label="Settings"
                    sections={[
                        { href: "/settings/profile", label: "Profile" },
                        { href: "/settings/people", label: "People" },
                    ]}
                />
            </MemoryRouter>
        </LinenProvider>,
    );
    const sections = within(
        screen.getByRole("navigation", { name: "Settings" }),
    );
    expect(sections.getByRole("link", { name: "Profile" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await userEvent.click(sections.getByRole("link", { name: "People" }));
    expect(sections.getByRole("link", { name: "People" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    expect(sections.getByRole("link", { name: "Profile" })).not.toHaveAttribute(
        "aria-current",
    );
});

function guarded() {
    const router = createMemoryRouter(
        [
            {
                element: (
                    <UnsavedChangesGuard>
                        <Link to="/elsewhere">Elsewhere</Link>
                        <Link to="/?sort=name">Sorted</Link>
                        <Outlet />
                    </UnsavedChangesGuard>
                ),
                children: [
                    { path: "/", element: <Draft name="the profile" /> },
                    { path: "/elsewhere", element: <p>Another page</p> },
                ],
            },
        ],
        { initialEntries: ["/"] },
    );
    render(
        <LinenProvider navigation={reactRouter}>
            <RouterProvider router={router} />
        </LinenProvider>,
    );
    return { user: userEvent.setup(), router };
}

const question = () =>
    screen.queryByRole("alertdialog", { name: "Leave without saving?" });

it("holds a move for unsaved work through a data router's blocker", async () => {
    const { user, router } = guarded();
    await user.type(screen.getByRole("textbox", { name: "the profile" }), "a");
    await user.click(screen.getByRole("link", { name: "Elsewhere" }));
    expect(question()).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(question()).toBeNull());
    expect(router.state.location.pathname).toBe("/");

    await user.click(screen.getByRole("link", { name: "Elsewhere" }));
    await user.click(await screen.findByRole("button", { name: "Leave" }));
    expect(router.state.location.pathname).toBe("/elsewhere");
});

it("lets a move that only changes the query go on", async () => {
    const { user, router } = guarded();
    await user.type(screen.getByRole("textbox", { name: "the profile" }), "a");
    await user.click(screen.getByRole("link", { name: "Sorted" }));
    expect(question()).toBeNull();
    expect(router.state.location.search).toBe("?sort=name");
});
