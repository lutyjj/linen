import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "../controls/Button";
import { CardHead, Count, Nothing } from "./Card";

it("draws a head whose actions or description are nothing as the head without them", () => {
    const plain = render(<CardHead title="Reports" />);
    const head = plain.container.innerHTML;
    plain.unmount();
    const editable = false as boolean;
    for (const nothing of [
        editable && <Button>Edit</Button>,
        null,
        "",
        [],
        [null, [false, ""]],
    ]) {
        for (const handed of [
            <CardHead title="Reports">{nothing}</CardHead>,
            <CardHead title="Reports" description={nothing} />,
        ]) {
            const { container, unmount } = render(handed);
            expect(container.innerHTML).toBe(head);
            unmount();
        }
    }
});

it("draws a description of 0, which is content", () => {
    render(<CardHead title="Reports" description={0} />);
    expect(screen.getByText("0")).toBeVisible();
});

it("draws a count of zero, or one handed nothing, as nothing", () => {
    const shown = false as boolean;
    for (const nothing of [0, shown && 3, null, "", []]) {
        const { container, unmount } = render(<Count>{nothing}</Count>);
        expect(container).toBeEmptyDOMElement();
        unmount();
    }
    render(<Count>3</Count>);
    expect(screen.getByText("3")).toBeVisible();
});

it("says there is nothing here in one paragraph, with a link in its line", () => {
    render(
        <Nothing>
            No tokens yet. <a href="#new">Make one</a>.
        </Nothing>,
    );
    expect(screen.getByRole("paragraph")).toHaveTextContent(
        "No tokens yet. Make one.",
    );
    expect(screen.getByRole("link", { name: "Make one" })).toBeVisible();
});
