import { createTailwindMerge } from "tailwind-merge";

import { mergeConfig } from "./merge-config";

/**
 * Join class names so the last word on a property wins.
 *
 * A component states its own look and takes a caller's `className` after it.
 * Concatenated, which of `px-4` and `px-2` applies is decided by the order
 * Tailwind wrote them into the stylesheet rather than the order the component
 * was handed them, so an override lands or does nothing depending on nothing
 * the caller can see. This resolves the conflict where it is written.
 *
 * It knows the class groups linen's components write, the groups that
 * override them, and every group on a prefix where a colour could stand, with
 * linen's own steps of the scales (merge-config.ts). A caller's class on any
 * property linen sets wins over linen's; classes on properties linen never
 * sets are joined as they are.
 */
export const classes = /* @__PURE__ */ createTailwindMerge(mergeConfig);
