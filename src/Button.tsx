import { type HTMLMotionProps, m } from "motion/react";
import type { ReactNode, Ref } from "react";

import { classes } from "./classes";
import { spring } from "./motion";

/**
 * Every button is visibly a button: a frame and a fill, never words alone.
 * What differs is how much the press commits to, and the ink says that.
 */
export type ButtonVariant = "default" | "primary" | "destructive" | "inverted";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    default:
        "border-border-strong bg-surface hover:border-text-muted hover:bg-sunken active:bg-border",
    // Text in the page colour rather than white: the accent is dark in the
    // light theme and light in the dark one, and only the page's own ink
    // reads on both.
    primary:
        "border-accent bg-accent text-bg hover:brightness-106 active:brightness-96 disabled:hover:brightness-100",
    // An act that destroys something says so before it is pressed, in the
    // same frame as its neighbours so it is no less a button than they are.
    destructive:
        "border-border-strong bg-surface text-danger hover:border-danger/60 hover:bg-danger/6 active:bg-danger/12",
    // For a surface painted in the text colour, where the page's own border
    // and surface tokens would vanish. Both themes invert, so this reads in
    // either one.
    inverted: "border-bg/25 bg-transparent text-bg hover:bg-bg/12",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
    ref?: Ref<HTMLButtonElement>;
    variant?: ButtonVariant;
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

const BUTTON_CLASS =
    "inline-flex h-(--height-control) shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-button border px-3 text-sm font-medium whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-45";

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

export function Button({
    variant = "default",
    className = "",
    children,
    ...rest
}: ButtonProps) {
    return (
        <m.button
            whileTap={rest.disabled ? undefined : { scale: 0.98 }}
            transition={spring("state")}
            type="button"
            className={classes(buttonClass(variant), className)}
            {...rest}
        >
            {children}
        </m.button>
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
