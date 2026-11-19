import type { ReactNode } from "react";

import { Button } from "../controls/Button";
import { useWaiting } from "../foundation/waiting";
import { DialogCancel, DialogLayout } from "./Dialog";
import { DialogRoot, DialogShell } from "./DialogRoot";

/**
 * Asks before an act is done, and states what it does and how much; an act
 * that destroys something always comes here. It confirms rather than offers
 * undo, because a confirmation the person read beats an undo they must notice.
 * It is an alert dialog, which a press beside it does not dismiss. An act that
 * can be put back exactly, such as a corrected value, takes a toast's undo
 * instead and does not come here.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    confirmLabel,
    destructive = false,
    disabled = false,
    width,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    /** The one question an act needs answered before it can be confirmed. */
    children?: ReactNode;
    confirmLabel: string;
    destructive?: boolean;
    /** For a dialog whose question is not answered yet, which few are. */
    disabled?: boolean;
    /** Wider than the default, for a question with long answers. */
    width?: string;
    /**
     * The act is confirmed. An act that takes a moment is the promise
     * returned: until it settles the confirm waits and the dialog cannot be
     * left. The app closes the dialog once the act is done.
     */
    onConfirm: () => void | Promise<unknown>;
}) {
    const [busy, wait] = useWaiting();
    return (
        <DialogRoot alert open={open} onOpenChange={onOpenChange} busy={busy}>
            <DialogShell open={open} width={width}>
                <DialogLayout
                    title={title}
                    description={description}
                    actions={
                        <>
                            <DialogCancel disabled={busy} />
                            <Button
                                variant={
                                    destructive ? "destructive" : "primary"
                                }
                                disabled={disabled}
                                busy={busy}
                                onClick={() => void wait(onConfirm())}
                            >
                                {confirmLabel}
                            </Button>
                        </>
                    }
                >
                    {children}
                </DialogLayout>
            </DialogShell>
        </DialogRoot>
    );
}
