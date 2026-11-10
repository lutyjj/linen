import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes";
import { useWords } from "./words";

export type ChipTone = "neutral" | "muted" | "accent" | "warn";
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
    warn: {
        text: "font-medium text-warn",
        border: "var(--color-warn)",
        strong: "var(--color-warn)",
        surface: "transparent",
    },
};

const SIZE: Record<ChipSize, string> = {
    subject:
        "-mx-1.5 h-(--height-control-inline) rounded-input px-1.5 text-sm font-medium",
    row: "h-(--height-control-inline) rounded-input px-2 text-xs",
    bar: "h-(--height-control-compact) rounded-button px-2.5 text-sm",
};

const FRAME: Record<ChipFrame, string> = {
    rest: "border-(--chip-border) bg-(--chip-surface)",
    hover: "border-transparent bg-transparent",
};

const UNDER_HAND: Record<ChipFrame, string> = {
    rest: "hover:border-(--chip-strong) data-[popup-open]:border-(--chip-strong)",
    hover: "hover:border-(--chip-border) hover:bg-(--chip-surface) focus-visible:border-(--chip-border) focus-visible:bg-(--chip-surface) data-[popup-open]:border-(--chip-border) data-[popup-open]:bg-(--chip-surface)",
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
            "inline-flex max-w-full min-w-0 items-center gap-1.5 border whitespace-nowrap ",
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
    children,
    ...style
}: ChipStyle & {
    onRemove?: () => void;
    /** What the cross takes away, where "Remove" alone says too little. */
    removeLabel?: string;
    children: ReactNode;
}) {
    const words = useWords();
    const { className, style: vars } = chipStyle(style);
    return (
        <span className={className} style={vars}>
            <span className="truncate">{children}</span>
            {onRemove && (
                <button
                    type="button"
                    aria-label={removeLabel ?? words.remove}
                    onClick={onRemove}
                    className="cursor-pointer text-sm/none opacity-60 hover:opacity-100"
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
                "cursor-pointer",
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

export function WarnDot() {
    return (
        <span
            aria-hidden="true"
            className="mr-1.25 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warn align-[1px]"
        />
    );
}

export function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="rounded-input border border-b-2 border-border-strong bg-surface px-1.25 py-px font-mono text-2xs text-text-secondary">
            {children}
        </kbd>
    );
}
