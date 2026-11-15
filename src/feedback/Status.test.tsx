import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Status } from "./Status";

it("says its state in words, and keeps its dot from readers", () => {
    const { container } = render(
        <Status tone="positive" active>
            Running
        </Status>,
    );
    expect(screen.getByText("Running")).toBeVisible();
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).not.toBeNull();
    // The beat is the stylesheet's (motion.css), keyed on this class.
    expect(dot).toHaveClass("live-mark");
});
