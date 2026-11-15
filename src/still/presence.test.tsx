import { render, screen } from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { expect, it } from "vitest";

/** The children of a presence, in the order the page shows them. */
function List({ items }: { items: readonly string[] }) {
    return (
        <div data-testid="list">
            <AnimatePresence>
                {items.map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </AnimatePresence>
        </div>
    );
}

const shown = () => screen.getByTestId("list").textContent;

it("shows a child added before the others before them", () => {
    const view = render(<List items={["A"]} />);
    view.rerender(<List items={["B", "A"]} />);
    expect(shown()).toBe("BA");
});

it("follows its children when they change places", () => {
    const view = render(<List items={["A", "B"]} />);
    view.rerender(<List items={["B", "A"]} />);
    expect(shown()).toBe("BA");
});
