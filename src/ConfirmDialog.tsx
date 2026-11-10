import type { ReactNode } from "react";

import { Button } from "./Button";
import { DialogCancel, DialogLayout } from "./Dialog";
import { DialogRoot, DialogShell } from "./Popup";

/**
 * Required for any action affecting more than one row, and for destroying a
 * record however few it is. It states what and how much.
 *
 * These confirm rather than offer undo, because a confirmation the user read
 * beats an undo they must notice. An act that can be put back exactly, such
 * as a corrected value, takes a toast's undo instead and does not come here.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    detail,
    children,
    confirmLabel,
    destructive = false,
    disabled = false,
    width,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    detail?: ReactNode;
    /** The one question an act needs answered before it can be confirmed. */
    children?: ReactNode;
    confirmLabel: string;
    destructive?: boolean;
    /** For a dialog whose question is not answered yet, which few are. */
    disabled?: boolean;
    /** Wider than the default, for a question with long answers. */
    width?: string;
    onConfirm: () => void;
}) {
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogShell open={open} width={width}>
                <DialogLayout
                    title={title}
                    description={detail}
                    actions={
                        <>
                            <DialogCancel />
                            <Button
                                variant={
                                    destructive ? "destructive" : "primary"
                                }
                                disabled={disabled}
                                onClick={() => {
                                    onConfirm();
                                    onOpenChange(false);
                                }}
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
