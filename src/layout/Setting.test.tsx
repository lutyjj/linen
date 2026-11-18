import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { SegmentedControl } from "../controls/SegmentedControl";
import { markup } from "../test/markup";
import { SettingRow, SettingToggle } from "./Setting";

it("describes a setting's control by what the setting does", () => {
    render(
        <>
            <SettingToggle
                title="Notifications"
                description="A message when a run fails."
                label="Notifications"
                checked
                onCheckedChange={() => undefined}
            />
            <SettingRow title="Density" description="How close the rows sit.">
                <SegmentedControl
                    label="Density"
                    value="compact"
                    options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                    ]}
                    onValueChange={() => undefined}
                />
            </SettingRow>
        </>,
    );
    expect(
        screen.getByRole("switch", { name: "Notifications" }),
    ).toHaveAccessibleDescription("A message when a run fails.");
    expect(
        screen.getByRole("radiogroup", { name: "Density" }),
    ).toHaveAccessibleDescription("How close the rows sit.");
});

it("makes each setting an item of a list where it is handed that role", () => {
    render(
        <div role="list" aria-label="Projects">
            <SettingRow role="listitem" title="Atlas" />
            <SettingRow role="listitem" title="Harbor" />
        </div>,
    );
    expect(
        screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["Atlas", "Harbor"]);
});

it("draws a setting whose description or control is nothing as one without them", () => {
    const { container, rerender } = render(<SettingRow title="Density" />);
    const row = markup(container);
    rerender(
        <SettingRow title="Density" description={false}>
            {false}
        </SettingRow>,
    );
    expect(markup(container)).toBe(row);
});
