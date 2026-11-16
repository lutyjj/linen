import { ArrowDown, Download } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { Button, IconButton } from "../controls/Button";
import { CopyButton } from "../controls/CopyValue";
import { classes } from "../foundation/classes";
import { useWords } from "../foundation/words";

/** How near the end a reader can be and still be at it, in pixels. */
const AT_END = 4;

/**
 * Text a machine writes, such as a log or a report, in a bounded box that
 * scrolls: monospace, as it was written. While the reader is at its end it
 * follows each line that arrives; once they scroll up to read, it stays
 * where they are, and a button brings them back to the latest lines. The
 * whole text can be copied, and saved as a file where it has a `filename`.
 */
export function LogView({
    label,
    text,
    filename,
    actions,
    className,
}: {
    /** What the text is, over it and as its name. */
    label: string;
    text: string;
    /** The name the text is saved under, such as `service.log`. */
    filename?: string;
    /** More controls beside copy and download, such as a pause. */
    actions?: ReactNode;
    className?: string;
}) {
    const words = useWords();
    const box = useRef<HTMLPreElement>(null);
    const following = useRef(true);
    const [behind, setBehind] = useState(false);

    const toEnd = () => {
        const element = box.current;
        if (element === null) return;
        element.scrollTop = element.scrollHeight;
        following.current = true;
        setBehind(false);
    };

    // Each new text follows the reader who is at the end, and tells the one
    // who is not that there is more below.
    useLayoutEffect(() => {
        if (following.current) toEnd();
        else setBehind(true);
    }, [text]);

    const download = () => {
        if (filename === undefined) return;
        const url = URL.createObjectURL(
            new Blob([text], { type: "text/plain" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        // The browser may read the file after the click returns.
        setTimeout(() => URL.revokeObjectURL(url));
    };

    return (
        <section
            aria-label={label}
            className={classes("flex min-w-0 flex-col gap-1.5", className)}
        >
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span className="mr-auto text-xs font-medium text-text-secondary">
                    {label}
                </span>
                {actions}
                <CopyButton
                    value={text}
                    label={label}
                    className="h-(--height-control-inline)"
                />
                {filename !== undefined && (
                    <IconButton
                        aria-label={`${words.download}: ${filename}`}
                        title={words.download}
                        onClick={download}
                        className="h-(--height-control-inline)"
                    >
                        <Download aria-hidden="true" className="size-4" />
                    </IconButton>
                )}
            </div>
            <div className="relative">
                <pre
                    ref={box}
                    tabIndex={0}
                    onScroll={(event) => {
                        const element = event.currentTarget;
                        const atEnd =
                            element.scrollTop + element.clientHeight >=
                            element.scrollHeight - AT_END;
                        following.current = atEnd;
                        if (atEnd) setBehind(false);
                    }}
                    className="max-h-80 min-h-24 overflow-auto rounded-input border border-border bg-sunken px-3 py-2 font-mono text-xs/5 wrap-anywhere whitespace-pre-wrap"
                >
                    {text}
                </pre>
                {behind && (
                    <Button
                        onClick={toEnd}
                        className="absolute right-3 bottom-3 h-(--height-control-compact) shadow-overlay"
                    >
                        <ArrowDown aria-hidden="true" className="size-3.5" />
                        {words.latestLines}
                    </Button>
                )}
            </div>
        </section>
    );
}
