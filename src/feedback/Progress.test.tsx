import { act, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import type { Readable } from "./live";
import { Progress } from "./Progress";

it("says how far it has come, and in which phase", () => {
    render(<Progress label="Uploading" value={0.4} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar).toHaveAttribute("aria-valuenow", "0.4");
    expect(bar).toHaveAttribute("aria-valuetext", "40%");
    expect(bar.style.getPropertyValue("--progress")).toBe("0.4");
});

it("says nothing of how far while it cannot tell", () => {
    render(<Progress label="Waiting for the device" />);
    const bar = screen.getByRole("progressbar", {
        name: "Waiting for the device",
    });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-valuetext");
});

it("says nothing of how far once it can no longer tell", () => {
    let tell: (value: number) => void = () => undefined;
    const done: Readable<number> = {
        subscribe: (listener) => {
            tell = listener;
            listener(0);
            return () => undefined;
        },
    };
    const { rerender } = render(<Progress label="Uploading" value={done} />);
    act(() => tell(0.3));
    rerender(<Progress label="Restarting" />);
    const bar = screen.getByRole("progressbar", { name: "Restarting" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-valuetext");
});

it("follows a value that changes on its own, and says a new phase politely", () => {
    let tell: (value: number) => void = () => undefined;
    const done: Readable<number> = {
        subscribe: (listener) => {
            tell = listener;
            listener(0.1);
            return () => undefined;
        },
    };
    const { rerender } = render(<Progress label="Uploading" value={done} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    act(() => tell(0.75));
    expect(bar).toHaveAttribute("aria-valuenow", "0.75");
    expect(bar.style.getPropertyValue("--progress")).toBe("0.75");

    rerender(<Progress label="Verifying" value={done} />);
    const phase = screen.getByText("Verifying");
    expect(phase).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("progressbar", { name: "Verifying" })).toBe(bar);
});
