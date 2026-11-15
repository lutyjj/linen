import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Notice } from "./Notice";

it("announces a failure at once and says the rest politely", () => {
    const { rerender } = render(
        <Notice tone="danger" title="The address was refused." />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
        "The address was refused.",
    );

    rerender(<Notice tone="positive" title="Saved." />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Saved.");
});

it("says what it means under its sentence, and offers its one action", () => {
    render(
        <Notice
            tone="warn"
            title="The copy is out of date."
            description="It was made before the last change."
            action={<button type="button">Make another</button>}
        />,
    );
    const notice = screen.getByRole("status");
    expect(notice).toHaveTextContent("It was made before the last change.");
    expect(
        screen.getByRole("button", { name: "Make another" }),
    ).toBeInTheDocument();
});
