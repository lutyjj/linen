import type { ReactNode } from "react";

/**
 * Whether a slot was handed content. A slot handed nothing, as a condition
 * hands `false`, `null`, an empty string or an array of those at any depth,
 * draws nothing of its own, as one never handed. Anything else is content:
 * `0`, and an element, a fragment or a promise, since linen cannot see
 * whether it renders nothing.
 */
export function isContent(node: ReactNode): boolean {
    if (Array.isArray(node)) return node.some(isContent);
    return node != null && typeof node !== "boolean" && node !== "";
}
