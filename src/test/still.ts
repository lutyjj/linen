import { afterEach } from "vitest";

/*
 * Without Motion, a prop the stand-in does not know reaches the element:
 * React warns about some, which setup.ts fails on in every project, and
 * writes others, such as `layout="position"`, onto the element unremarked.
 * Either is a gap in src/still/still.tsx, so this fails the test too.
 */
const MOTION_ATTRIBUTES = new Set(
    [
        "initial",
        "animate",
        "exit",
        "transition",
        "variants",
        "custom",
        "inherit",
        "viewport",
        "layout",
        "layoutId",
        "layoutScroll",
        "layoutRoot",
        "layoutDependency",
        "whileHover",
        "whileTap",
        "whileFocus",
        "whileInView",
        "whileDrag",
    ].map((name) => name.toLowerCase()),
);

const reported: string[] = [];

function inspect(element: Element) {
    for (const { name } of element.attributes) {
        if (MOTION_ATTRIBUTES.has(name)) {
            reported.push(`<${element.localName} ${name}>`);
        }
    }
}

new MutationObserver((records) => {
    for (const record of records) {
        if (record.type === "attributes" && record.target instanceof Element) {
            inspect(record.target);
        }
        for (const added of record.addedNodes) {
            if (!(added instanceof Element)) continue;
            inspect(added);
            for (const inner of added.querySelectorAll("*")) inspect(inner);
        }
    }
}).observe(document, { subtree: true, childList: true, attributes: true });

afterEach(() => {
    const found = reported.splice(0);
    if (found.length > 0) {
        throw new Error(
            `A Motion prop reached the page:\n${[...new Set(found)].join("\n")}`,
        );
    }
});
