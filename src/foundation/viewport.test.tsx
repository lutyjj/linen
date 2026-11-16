import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useNarrow, useWidth } from "./viewport";

const unstubbed = Object.getOwnPropertyDescriptor(window, "matchMedia");

afterEach(() => {
    if (unstubbed !== undefined) {
        Object.defineProperty(window, "matchMedia", unstubbed);
    }
    vi.restoreAllMocks();
});

it("says a window below md is narrow, and follows it across", () => {
    let width = 390;
    const listeners = new Set<() => void>();
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: (query: string) =>
            ({
                get matches() {
                    return query === "(min-width: 768px)" && width >= 768;
                },
                addEventListener: (_: string, listener: () => void) =>
                    listeners.add(listener),
                removeEventListener: (_: string, listener: () => void) =>
                    listeners.delete(listener),
            }) as unknown as MediaQueryList,
    });
    function Layout() {
        return <p>{useNarrow() ? "Phone" : "Desk"}</p>;
    }
    render(<Layout />);
    expect(screen.getByText("Phone")).toBeInTheDocument();
    act(() => {
        width = 1280;
        for (const listener of listeners) listener();
    });
    expect(screen.getByText("Desk")).toBeInTheDocument();
});

it("measures the element it is on, and the one that takes its place", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
        function (this: HTMLElement) {
            return { width: Number(this.dataset.width) } as DOMRect;
        },
    );
    function Rows({ cards }: { cards: boolean }) {
        const [measure, width] = useWidth();
        return cards ? (
            <ul ref={measure} data-width="320" aria-label={`${width}`} />
        ) : (
            <table ref={measure} data-width="640" aria-label={`${width}`} />
        );
    }
    const { rerender } = render(<Rows cards={false} />);
    expect(screen.getByRole("table")).toHaveAccessibleName("640");
    rerender(<Rows cards />);
    expect(screen.getByRole("list")).toHaveAccessibleName("320");
});
