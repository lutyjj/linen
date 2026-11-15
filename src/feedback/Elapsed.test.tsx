import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Elapsed, elapsedText } from "./Elapsed";

afterEach(() => vi.useRealTimers());

it("reads a span of time as a clock does", () => {
    expect(elapsedText(0)).toBe("0:00");
    expect(elapsedText(42_900)).toBe("0:42");
    expect(elapsedText(725_000)).toBe("12:05");
    expect(elapsedText(3_729_000)).toBe("1:02:09");
    expect(elapsedText(-5_000)).toBe("0:00");
});

it("counts up once a second, as a timer that is not read out", () => {
    vi.useFakeTimers({ now: 100_000 });
    render(<Elapsed since={100_000 - 59_000} />);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent("0:59");
    act(() => {
        vi.advanceTimersByTime(1000);
    });
    expect(timer).toHaveTextContent("1:00");
});

it("keeps its even figures beside the caller's classes", () => {
    render(<Elapsed since={Date.now()} className="text-danger" />);
    expect(screen.getByRole("timer")).toHaveClass(
        "tabular-nums",
        "text-danger",
    );
});
