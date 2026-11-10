import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { CopyValue, ShownOnce } from "./ShownOnce";
import { ENGLISH, LinenProvider } from "./words";

function clipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
    });
}

afterEach(() => vi.restoreAllMocks());

it("copies the whole value and says so", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    clipboard(writeText);
    render(<CopyValue label="Address" value="https://api.example.com/v1" />);

    await user.click(screen.getByRole("button", { name: "Copy: Address" }));

    expect(writeText).toHaveBeenCalledWith("https://api.example.com/v1");
    expect(
        screen.getByRole("button", { name: "Copy: Address" }),
    ).toHaveAttribute("title", ENGLISH.copied);
    expect(screen.queryByRole("alert")).toBeNull();
});

it("asks for the text to be taken by hand where the browser refuses", async () => {
    const user = userEvent.setup();
    clipboard(() => Promise.reject(new Error("refused")));
    render(<CopyValue label="Address" value="https://api.example.com/v1" />);

    await user.click(screen.getByRole("button", { name: "Copy: Address" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
        ENGLISH.copyRefused,
    );
});

it("puts what the button names on the clipboard, in the app's words", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    clipboard(writeText);
    render(
        <LinenProvider words={{ ...ENGLISH, copied: "Kopiert" }}>
            <ShownOnce
                what="Code"
                label="Invitation code"
                secret="K7Q2"
                copies="Join with K7Q2"
                copyLabel="Copy message"
            >
                Send it on.
            </ShownOnce>
        </LinenProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Copy message" }));

    expect(writeText).toHaveBeenCalledWith("Join with K7Q2");
    expect(screen.getByRole("button", { name: "Kopiert" })).toBeVisible();
});

it("asks for the text by hand where the page has no clipboard at all", async () => {
    // user-event lends the page a clipboard of its own, so it goes after setup.
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
    });
    render(
        <>
            <CopyValue label="Address" value="https://api.example.com/v1" />
            <ShownOnce
                what="Token"
                label="Access token"
                secret="lin_secret"
                copyLabel="Copy token"
            >
                Keep it.
            </ShownOnce>
        </>,
    );

    await user.click(screen.getByRole("button", { name: "Copy: Address" }));
    await user.click(screen.getByRole("button", { name: "Copy token" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(2);
    for (const alert of alerts) {
        expect(alert).toHaveTextContent(ENGLISH.copyRefused);
    }
});
