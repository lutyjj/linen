import { act, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Gauge, Gauges, type Readable } from "./Gauge";

/** A value that changes on its own, as a signal or a store's does. */
function source(first: number) {
    let current = first;
    const listeners = new Set<(value: number) => void>();
    const readable: Readable<number> = {
        subscribe: (listener) => {
            listeners.add(listener);
            listener(current);
            return () => listeners.delete(listener);
        },
    };
    return {
        readable,
        set: (value: number) => {
            current = value;
            for (const listener of listeners) listener(value);
        },
        listening: () => listeners.size,
    };
}

it("is a meter that names its value in words", () => {
    render(
        <Gauge
            label="Disk"
            value={0.42}
            format={(value) => `${Math.round(value * 100)}%`}
        />,
    );
    const disk = screen.getByRole("meter", { name: "Disk" });
    expect(disk).toHaveAttribute("aria-valuemin", "0");
    expect(disk).toHaveAttribute("aria-valuemax", "1");
    expect(disk).toHaveAttribute("aria-valuenow", "0.42");
    expect(disk).toHaveAttribute("aria-valuetext", "42%");
});

it("follows a value that changes on its own without rendering what holds it", () => {
    const level = source(-30);
    let renders = 0;
    function Panel() {
        renders += 1;
        return (
            <Gauges label="Output">
                <Gauge
                    label="Left"
                    value={level.readable}
                    min={-60}
                    max={0}
                    format={(value) => `${value} dB`}
                    marks={[{ value: -6, kind: "set", label: "Limit" }]}
                />
            </Gauges>
        );
    }
    const view = render(<Panel />);
    const left = screen.getByRole("meter", { name: "Left" });
    expect(screen.getByRole("group", { name: "Output" })).toContainElement(
        left,
    );
    expect(left).toHaveAttribute("aria-valuetext", "-30 dB");

    act(() => {
        for (const value of [-24, -18, -12]) level.set(value);
    });
    expect(left).toHaveAttribute("aria-valuenow", "-12");
    expect(left).toHaveAttribute("aria-valuetext", "-12 dB");
    expect(left).toHaveTextContent("-12 dB");
    expect(left.style.getPropertyValue("--level")).toBe("0.8");
    expect(renders).toBe(1);

    view.unmount();
    expect(level.listening()).toBe(0);
});

it("holds a value beyond its scale at the scale's end", () => {
    render(<Gauge label="Load" value={7} min={0} max={4} />);
    const load = screen.getByRole("meter", { name: "Load" });
    expect(load.style.getPropertyValue("--level")).toBe("1");
    expect(load).toHaveAttribute("aria-valuenow", "7");
});

it("writes its value again the new way when its scale changes", () => {
    const { rerender } = render(
        <Gauge label="Load" value={2} max={4} format={(value) => `${value}`} />,
    );
    const load = screen.getByRole("meter", { name: "Load" });
    expect(load.style.getPropertyValue("--level")).toBe("0.5");

    rerender(
        <Gauge
            label="Load"
            value={2}
            max={8}
            format={(value) => `${value} of 8`}
        />,
    );
    expect(load.style.getPropertyValue("--level")).toBe("0.25");
    expect(load).toHaveTextContent("2 of 8");
    expect(load).toHaveAttribute("aria-valuetext", "2 of 8");
});
