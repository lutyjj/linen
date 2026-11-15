import { spring } from "motion";
import { expect, it } from "vitest";

import stylesheet from "../styles/motion.css?raw";
import { type MotionToken, seconds } from "./tokens";

/** A custom property's value on the stylesheet's root, whitespace folded. */
function rootValue(name: string): string {
    const root = stylesheet.slice(stylesheet.indexOf(":root {"));
    const found = new RegExp(`--${name}:([^;]+);`).exec(root);
    if (found?.[1] === undefined) throw new Error(`no --${name}`);
    return found[1]
        .replace(/\s+/g, " ")
        .replace(/\( /g, "(")
        .replace(/,? \)/g, ")")
        .trim();
}

it("gives CSS the springs Motion runs, so both keep one clock", () => {
    for (const token of [
        "leave",
        "state",
        "enter",
    ] as const satisfies MotionToken[]) {
        expect(rootValue(`motion-${token}`)).toBe(
            String(spring(seconds(token), 0)),
        );
    }
});

it("gives CSS the holds Motion's tokens name", () => {
    for (const token of [
        "mark",
        "land",
        "thinking",
        "live",
    ] as const satisfies MotionToken[]) {
        expect(rootValue(`motion-${token}`)).toBe(`${seconds(token) * 1000}ms`);
    }
});
