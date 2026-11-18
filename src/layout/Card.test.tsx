import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "../controls/Button";
import { CardHead } from "./Card";

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
