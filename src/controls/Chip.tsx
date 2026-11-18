import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classes } from "../foundation/classes";
import type { Tone } from "../foundation/tone";
import { useWords } from "../foundation/words";

/** A chip speaks in a tone, is plain, or steps back. */
export type ChipTone = "neutral" | "muted" | Tone;
export type ChipSize = "subject" | "row" | "bar";
export type ChipFrame = "rest" | "hover";

interface Ink {
    text: string;
    border: string;
    strong: string;
    surface: string;
}

const TONE: Record<ChipTone, Ink> = {
    neutral: {
        text: "text-text",
        border: "var(--color-border)",
        strong: "var(--color-border-strong)",
        surface: "var(--color-sunken)",
    },
    muted: {
        text: "text-text-muted",
        border: "var(--color-border)",
        strong: "var(--color-border-strong)",
        surface: "var(--color-sunken)",
    },
    accent: {
        text: "font-medium text-accent",
        border: "var(--color-accent)",
        strong: "var(--color-accent)",
        surface: "var(--color-accent-weak)",
    },
    positive: {
        text: "font-medium text-positive",
        border: "var(--color-positive)",
        strong: "var(--color-positive)",
        surface: "transparent",
    },
    warn: {
        text: "font-medium text-warn",
        border: "var(--color-warn)",
        strong: "var(--color-warn)",
        surface: "transparent",
    },
    danger: {
        text: "font-medium text-danger",
        border: "var(--color-danger)",
        strong: "var(--color-danger)",
        surface: "transparent",
    },
};

const SIZE: Record<ChipSize, string> = {
    subject:
        "-mx-2 h-(--height-control-inline) rounded-input px-2 text-sm font-medium",
    row: "h-(--height-control-inline) rounded-input px-2 text-xs",
    bar: "h-(--height-control-compact) rounded-button px-2.5 text-sm",
};

const FRAME: Record<ChipFrame, string> = {
    rest: "border-(--chip-border) bg-(--chip-surface)",
    hover: "border-transparent bg-transparent",
};

const UNDER_HAND: Record<ChipFrame, string> = {
    rest: "pressable:hover:border-(--chip-strong) data-[popup-open]:border-(--chip-strong)",
    hover: "pressable:hover:border-(--chip-border) pressable:hover:bg-(--chip-surface) focus-visible:border-(--chip-border) focus-visible:bg-(--chip-surface) data-[popup-open]:border-(--chip-border) data-[popup-open]:bg-(--chip-surface)",
};

export interface ChipStyle {
    tone?: ChipTone;
    size?: ChipSize;
    frame?: ChipFrame;
}

function chipStyle({ tone = "neutral", size = "bar", frame }: ChipStyle) {
    const ink = TONE[tone];
    const shown =
        frame ?? (size === "subject" || tone === "muted" ? "hover" : "rest");
    return {
        frame: shown,
        className: classes(
            "inline-flex max-w-full min-w-0 items-center gap-2 border whitespace-nowrap",
            ink.text,
            SIZE[size],
            FRAME[shown],
        ),
        style: {
            "--chip-border": ink.border,
            "--chip-strong": ink.strong,
            "--chip-surface": ink.surface,
        } as Record<string, string>,
    };
}

export function Chip({
    onRemove,
    removeLabel,
    className,
    children,
    ...style
}: ChipStyle & {
    onRemove?: () => void;
    /** What the cross takes away, where "Remove" alone says too little. */
    removeLabel?: string;
    className?: string;
    children: ReactNode;
}) {
    const words = useWords();
    const { className: chip, style: vars } = chipStyle(style);
    return (
        <span className={classes(chip, className)} style={vars}>
            <span className="truncate">{children}</span>
            {onRemove && (
                <button
                    type="button"
                    aria-label={removeLabel ?? words.remove}
                    onClick={onRemove}
                    className="relative cursor-pointer text-sm/none opacity-60 after:absolute after:-inset-2 hover:opacity-100"
                >
                    ×
                </button>
            )}
        </span>
    );
}

export function ChipTrigger({
    tone,
    size,
    frame,
    className = "",
    style: given,
    children,
    ...rest
}: ChipStyle &
    ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
    const {
        className: chip,
        style,
        frame: shown,
    } = chipStyle({ tone, size, frame });
    return (
        <button
            type="button"
            className={classes(
                "pressable:cursor-pointer inactive:dimmed",
                chip,
                UNDER_HAND[shown],
                className,
            )}
            {...rest}
            style={{ ...given, ...style }}
        >
            <span className="truncate">{children}</span>
        </button>
    );
}
