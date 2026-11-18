import type { HTMLAttributes } from "react";

/**
 * Every popup's surface. `popup` is its motion (motion.css): it grows
 * out of the control that opened it and leaves toward it, and Base UI keeps
 * it until it has. Each popup holds its part's `Arrow`, drawn at no size:
 * with one, Base UI names the middle of the control's facing edge as the
 * popup's `--transform-origin`, wherever a collision has moved the popup.
 * It is never wider than the room its positioner finds on the screen
 * (`--available-width`), so a long choice wraps instead of running off it.
 */
export const POPUP_CLASS =
    "popup max-w-(--available-width) rounded-card border border-border bg-surface p-1 text-sm shadow-overlay outline-none";

/**
 * Every popup rides on a positioner, and the stacking order belongs there: the
 * popup itself is statically positioned, so a z-index on it does nothing while
 * the sticky table headers it must clear carry one of their own.
 */
export const POSITIONER_CLASS = "z-50";

/** One choice in a popup's list, highlighted and disabled the same way in every picker. */
export const OPTION_CLASS =
    "rounded-input px-2 py-1.5 pressable:cursor-pointer data-[highlighted]:bg-accent-weak data-[highlighted]:text-accent inactive:dimmed";

/**
 * Renders a Base UI part that leaves with an exit, a popup, a dialog or a
 * panel, inert while it does: it is still seen going, but it takes no
 * pointer and no keys and is no longer read out, so the control a hand
 * reaches for next answers, and a list on its way out is not a second list.
 * `aria-hidden` says the same to readers of the accessibility tree that do
 * not account for `inert`.
 */
export function renderLeaving(
    props: HTMLAttributes<HTMLDivElement>,
    state: { transitionStatus?: string },
) {
    const leaving = state.transitionStatus === "ending";
    return (
        <div
            {...props}
            inert={leaving}
            aria-hidden={leaving || props["aria-hidden"]}
        />
    );
}
