import { extendTailwindMerge } from "tailwind-merge";

/**
 * Join class names so the last word on a property wins.
 *
 * A component states its own look and takes a caller's `className` after it.
 * Concatenated, which of `px-4` and `px-2` applies is decided by the order
 * Tailwind wrote them into the stylesheet rather than the order the component
 * was handed them, so an override lands or does nothing depending on nothing
 * the caller can see. This resolves the conflict where it is written.
 *
 * tailwind-merge knows every class group; it is taught the steps linen.css
 * adds to the scales: `text-hero` is a size and not a colour, the radii are
 * named after what they wrap, `shadow-overlay` is a shadow, and `gutter` is a
 * step of the spacing scale, so `pl-0` given later replaces `pl-gutter`.
 */
export const classes = /* @__PURE__ */ extendTailwindMerge({
    extend: {
        theme: {
            text: ["hero"],
            radius: ["check", "input", "button", "card", "dialog"],
            shadow: ["overlay"],
            spacing: ["gutter"],
        },
    },
});
