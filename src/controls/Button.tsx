import type { ComponentProps, ReactNode } from "react";

import { classes } from "../foundation/classes";

/**
 * Every button is visibly a button: a frame and a fill, never words alone.
 * What differs is how much the press commits to, and the ink says that.
 */
export type ButtonVariant = "default" | "primary" | "destructive" | "inverted";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    default:
        "border-border-strong bg-surface pressable:hover:border-text-muted",
    // Text in the page colour rather than white: the accent is dark in the
    // light theme and light in the dark one, and only the page's own ink
    // reads on both. Disabled, it gives up the ink and dims as a default
    // button does, so it neither looks ready nor loses its words.
    primary:
        "border-accent bg-accent text-bg inactive:border-border-strong inactive:bg-surface inactive:text-text",
    // An act that destroys something says so before it is pressed, in the
    // same frame as its neighbours so it is no less a button than they are.
    destructive:
        "border-border-strong bg-surface text-danger pressable:hover:border-danger/60",
    // For a surface painted in the text colour, where the page's own border
    // and surface tokens would vanish. Both themes invert, so this reads in
    // either one.
    inverted: "border-bg/25 bg-transparent text-bg",
};

export interface ButtonProps extends ComponentProps<"button"> {
    variant?: ButtonVariant;
    /**
     * What it started is under way: it says so with a pass of light across
     * its face, keeps its words and so its width, and takes no second press
     * until the answer comes.
     */
    busy?: boolean;
    children: ReactNode;
}

/** Related controls wrap together, with the same spacing in headers and forms. */
export function Actions({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={classes("flex flex-wrap items-center gap-2", className)}
        >
            {children}
        </div>
    );
}

/** `press` answers the hand (motion.css). */
const BUTTON_CLASS =
    "press inline-flex h-(--height-control) shrink-0 items-center justify-center gap-1.5 rounded-button border px-3 text-sm font-medium whitespace-nowrap select-none pressable:cursor-pointer inactive:dimmed";

/**
 * A button's look for something that is not a button element: a link that
 * goes where the action happens, such as the page that creates a thing.
 */
export function buttonClass(variant: ButtonVariant = "default"): string {
    return classes(BUTTON_CLASS, VARIANT_CLASS[variant]);
}

/**
 * A link inside running text: the ink, underlined, so it reads as a way
 * somewhere among words that are not.
 */
export const LINK_CLASS =
    "font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-current";

function held(ariaDisabled: ButtonProps["aria-disabled"]): boolean {
    return ariaDisabled === true || ariaDisabled === "true";
}

export function Button({
    variant = "default",
    busy = false,
    className = "",
    onClick,
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type="button"
            {...rest}
            aria-busy={busy || undefined}
            aria-disabled={busy || rest["aria-disabled"]}
            onClick={(event) => {
                // A press while it waits, or on a button the caller marked
                // disabled for good, starts nothing, a form's submit
                // included; the button keeps the focus it has.
                if (busy || held(rest["aria-disabled"])) {
                    event.preventDefault();
                    return;
                }
                onClick?.(event);
            }}
            className={classes(
                buttonClass(variant),
                busy && "thinking",
                className,
            )}
        >
            {children}
        </button>
    );
}

/** Icon actions stay square at the height of their surrounding controls. */
export function IconButton({
    className,
    ...props
}: ButtonProps & { "aria-label": string }) {
    return (
        <Button
            {...props}
            className={classes("aspect-square px-0", className)}
        />
    );
}
