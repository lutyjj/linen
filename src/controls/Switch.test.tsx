import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Switch } from "./Switch";

it("holds while the change it made is written", async () => {
    const turned = vi.fn();
    render(
        <Switch
            aria-label="Notifications"
            checked
            busy
            onCheckedChange={turned}
        />,
    );
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toHaveAttribute("aria-busy", "true");
    await userEvent.click(toggle);
    expect(turned).not.toHaveBeenCalled();
    expect(toggle).toBeChecked();
});
