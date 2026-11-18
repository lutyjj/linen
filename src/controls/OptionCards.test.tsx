import { Field } from "@base-ui/react/field";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionCards } from "./OptionCards";

const OPTIONS = [
    { value: "keep", label: "Keep it", description: "Nothing changes." },
    {
        value: "archive",
        label: "Archive it",
        description: "It leaves the list and stays readable.",
    },
] as const;

function cards(onValueChange = vi.fn()) {
    return (
        <OptionCards
            label="Its fate"
            value={undefined}
            options={OPTIONS}
            onValueChange={onValueChange}
        />
    );
}

describe("one answer from a few, each with a line", () => {
    it("names each card by its words and describes it by its line", () => {
        render(cards());
        expect(
            screen.getByRole("radio", { name: "Archive it" }),
        ).toHaveAccessibleDescription("It leaves the list and stays readable.");
    });

    it("keeps each card's own name inside a field", () => {
        render(
            <Field.Root>
                <Field.Label nativeLabel={false} render={<div />}>
                    What happens to it
                </Field.Label>
                {cards()}
            </Field.Root>,
        );
        expect(
            screen.getByRole("radiogroup", { name: "What happens to it" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Keep it" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Archive it" }),
        ).toBeInTheDocument();
    });

    it("answers with the card pressed", async () => {
        const onValueChange = vi.fn();
        render(cards(onValueChange));
        await userEvent.click(
            screen.getByRole("radio", { name: "Archive it" }),
        );
        expect(onValueChange).toHaveBeenCalledWith("archive");
    });
});

it("draws a card whose line is nothing as its words alone, describing nothing", () => {
    render(
        <OptionCards
            label="Its fate"
            value={undefined}
            options={[{ value: "keep", label: "Keep it", description: false }]}
            onValueChange={() => undefined}
        />,
    );
    const card = screen.getByRole("radio", { name: "Keep it" });
    expect(card).not.toHaveAttribute("aria-describedby");
    // Its line is required, so there is no card without one to match: the
    // card holds its words and nothing under them.
    expect(card.children).toHaveLength(1);
    expect(card.firstElementChild).toHaveTextContent("Keep it");
});

describe("a suggested answer", () => {
    function suggesting(value: "keep" | "archive" | undefined) {
        return (
            <OptionCards
                label="Its fate"
                value={value}
                options={OPTIONS}
                suggested="archive"
                suggestedMark={<span>Suggested</span>}
                onValueChange={() => undefined}
            />
        );
    }

    it("wears its mark before its words while the question is open", () => {
        render(suggesting(undefined));
        const card = screen.getByRole("radio", { name: /Archive it$/ });
        expect(card).toHaveTextContent(/^SuggestedArchive it/);
        expect(
            screen.getByRole("radio", { name: "Keep it" }),
        ).not.toHaveTextContent("Suggested");
    });

    it("is one answer among the others once the question is answered", () => {
        const { rerender } = render(suggesting("keep"));
        expect(
            screen.getByRole("radio", { name: "Archive it" }),
        ).not.toHaveTextContent("Suggested");
        rerender(suggesting("archive"));
        expect(screen.getByRole("radio", { name: "Archive it" })).toBeChecked();
    });
});
