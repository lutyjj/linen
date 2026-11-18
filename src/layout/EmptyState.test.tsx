import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "../controls/Button";
import { EmptyState } from "./EmptyState";

it("draws no room for a description or a way to start that is nothing", () => {
    const { container, rerender } = render(<EmptyState title="No reports" />);
    const empty = container.innerHTML;
    const allowed = false as boolean;
    rerender(
        <EmptyState title="No reports" description={allowed && "Make one."}>
            {allowed && <Button>New report</Button>}
        </EmptyState>,
    );
    expect(container.innerHTML).toBe(empty);
});
