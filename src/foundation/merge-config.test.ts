import { extendTailwindMerge } from "tailwind-merge";
import { expect, it } from "vitest";

import {
    holdsClasses,
    LINEN_THEME,
    mergeConfigSource,
    words,
} from "../../tools/merge-config";
import { classes } from "./classes";
import generated from "./merge-config.ts?raw";

const sources = Object.entries(
    import.meta.glob<string>("/src/**/*.{ts,tsx}", {
        query: "?raw",
        import: "default",
        eager: true,
    }),
)
    .filter(([path]) => holdsClasses(path))
    .map(([, source]) => source);

/** tailwind-merge with every class group it knows. */
const everything = extendTailwindMerge({ extend: { theme: LINEN_THEME } });

it("merges with the configuration linen's sources call for", () => {
    expect(generated).toBe(mergeConfigSource(sources));
});

it("settles every conflict between linen's own classes as tailwind-merge does", () => {
    // The classes themselves, once each: a variant such as `hover:` is read
    // by the same code in either merge, so the bare class stands for all of
    // them, and a word tailwind-merge does not know as a class conflicts
    // with nothing in either.
    const own = [
        ...new Set(
            [...words(sources)].map((word) =>
                word.slice(word.lastIndexOf(":") + 1).replace(/^!/, ""),
            ),
        ),
    ].filter((word) => everything(word, word) === word);
    const differ: string[] = [];
    for (const first of own) {
        for (const then of own) {
            if (first === then) continue;
            if (classes(first, then) !== everything(first, then)) {
                differ.push(`${first} ${then}`);
            }
        }
    }
    expect(differ).toEqual([]);
});

it("reads a caller's class on a colour's prefix as what it is", () => {
    for (const [own, caller] of [
        ["text-text-secondary", "text-balance"],
        ["bg-surface", "bg-cover"],
        ["border-border", "border-dashed"],
        ["decoration-accent/40", "decoration-2"],
        ["outline-accent", "outline-dashed"],
        ["font-medium", "font-mono"],
        ["shadow-overlay", "shadow-none"],
    ] as const) {
        expect(classes(own, caller)).toBe(everything(own, caller));
    }
});
