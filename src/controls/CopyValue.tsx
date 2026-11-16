import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

import { classes } from "../foundation/classes";
import { useWords } from "../foundation/words";
import { Button, IconButton } from "./Button";

/** Whether the browser let us put the text on the clipboard. */
type Copying = "ready" | "copied" | "by hand";

/**
 * Putting text on the clipboard, and what came of it. A browser can refuse,
 * and a page served without TLS on a network address has no clipboard at
 * all; either way the text has to be selectable and the control has to say
 * so.
 */
function useCopy(text: string): { copying: Copying; copy: () => void } {
    const [copying, setCopying] = useState<Copying>("ready");
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopying("copied");
        } catch {
            setCopying("by hand");
        }
    };
    return { copying, copy: () => void copy() };
}

function Refused({ className }: { className?: string }) {
    const words = useWords();
    return (
        <span role="alert" className={classes("text-xs text-warn", className)}>
            {words.copyRefused}
        </span>
    );
}

/**
 * The control that puts a value on the clipboard, named for what it takes,
 * and the words that ask for the value by hand where the browser refuses.
 * They stand in a row that wraps: the words take a line of their own.
 */
export function CopyButton({
    value,
    label,
    className,
}: {
    value: string;
    /** What the value is, for the control's name. */
    label: string;
    className?: string;
}) {
    const words = useWords();
    const { copying, copy } = useCopy(value);
    return (
        <>
            <IconButton
                aria-label={`${words.copy}: ${label}`}
                title={copying === "copied" ? words.copied : words.copy}
                onClick={copy}
                className={className}
            >
                {copying === "copied" ? (
                    <Check aria-hidden="true" className="size-4" />
                ) : (
                    <Copy aria-hidden="true" className="size-4" />
                )}
            </IconButton>
            {copying === "by hand" && <Refused className="basis-full" />}
        </>
    );
}

/**
 * A value to take whole: an address, a command, a header. It is shown in
 * full, wrapping at its spaces, so it can be read at rest and selected by
 * hand where the browser refuses the clipboard.
 */
export function CopyValue({
    value,
    label,
    className,
}: {
    value: string;
    /** What the value is, for the copy control's name. */
    label: string;
    className?: string;
}) {
    return (
        <span
            className={classes(
                "flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1",
                className,
            )}
        >
            <code
                aria-label={label}
                className="min-h-(--height-control) min-w-0 flex-1 rounded-input bg-sunken px-2.5 py-1.5 font-mono text-xs/5 break-words select-all"
            >
                {value}
            </code>
            <CopyButton value={value} label={label} />
        </span>
    );
}

/**
 * A secret shown once and never again, with the words that carry it and the
 * one control that takes them: a key or a code the other side keeps only a
 * hash of, so what is on screen is the only copy there will ever be. What
 * losing it means is said under the words above it, in the app's words
 * where the default does not fit.
 */
export function ShownOnce({
    what,
    label,
    secret,
    copies,
    copyLabel,
    lost,
    className,
    children,
}: {
    /** What was made, named as the section names it. */
    what: string;
    /** The accessible name of the secret itself, for reading it back. */
    label: string;
    secret: string;
    /** What the button puts on the clipboard, where that is more than the secret. */
    copies?: string;
    /** What the control says it takes, which is what it takes. */
    copyLabel: string;
    /**
     * What losing it means, such as how another is made, in place of the
     * words' own sentence (`shownOnce`).
     */
    lost?: ReactNode;
    className?: string;
    /** What to say about it, above the secret. */
    children: ReactNode;
}) {
    const words = useWords();
    const { copying, copy } = useCopy(copies ?? secret);

    return (
        <div className={className}>
            <p className="mb-2 text-xs text-text-secondary">
                {children} {lost ?? words.shownOnce}
            </p>
            {copies !== undefined && (
                <p className="mb-3 text-sm break-words select-all">{copies}</p>
            )}
            <p className="mb-3 text-sm">
                <span className="text-text-secondary">{what}:</span>{" "}
                <code
                    aria-label={label}
                    className="font-mono break-all select-all"
                >
                    {secret}
                </code>
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={copy}>
                    {copying === "copied" ? words.copied : copyLabel}
                </Button>
                {copying === "by hand" && <Refused />}
            </div>
        </div>
    );
}
