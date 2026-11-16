import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

import { Actions, Button } from "../controls/Button";
import { Form } from "../fields/Form";
import { useWaiting } from "../foundation/waiting";
import { useWords } from "../foundation/words";
import { DialogRoot, DialogShell } from "./DialogRoot";

/**
 * What every dialog lays out the same way: its title, what it is about, what
 * it asks, and its actions at the end, the one it exists for last. In a
 * window too short for all of it, the title and the actions keep their places
 * and what lies between them scrolls. Its parts stand in the dialog's column,
 * so an element placed around it, such as a `Form`, is `flex min-h-0
 * flex-col`.
 */
export function DialogLayout({
    title,
    description,
    children,
    actions,
}: {
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    actions: ReactNode;
}) {
    return (
        <>
            <Dialog.Title className="shrink-0 text-md font-semibold">
                {title}
            </Dialog.Title>
            {(description !== undefined || children !== undefined) && (
                // Scrolls once the dialog meets the window's edges, with a
                // hairline at each edge something lies past (motion.css). Its
                // padding keeps a focus ring at its sides and foot in view.
                <div className="dialog-body -mx-1 -mt-px -mb-[calc(--spacing(1)+1px)] min-h-0 overflow-y-auto border-y border-transparent px-1 pb-1">
                    {description !== undefined && (
                        <Dialog.Description className="mt-1.5 text-sm text-text-secondary">
                            {description}
                        </Dialog.Description>
                    )}
                    {children !== undefined && (
                        <div className="mt-4">{children}</div>
                    )}
                </div>
            )}
            <Actions className="mt-5 shrink-0 justify-end">{actions}</Actions>
        </>
    );
}

/** The way out of a dialog, which changes nothing. */
export function DialogCancel({
    label,
    disabled = false,
}: {
    label?: string;
    /** While the dialog's confirm is busy, there is no way out yet. */
    disabled?: boolean;
}) {
    const words = useWords();
    return (
        <Dialog.Close
            disabled={disabled}
            render={<Button>{label ?? words.cancel}</Button>}
        />
    );
}

/**
 * A dialog that asks for a few answers and does one thing with them: invite a
 * person, make a token. It is a form, so Enter in a field submits it, and its
 * submit stays disabled until the answers are enough.
 */
export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    disabled = false,
    onConfirm,
    width,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    confirmLabel: string;
    disabled?: boolean;
    /**
     * The answers are given; the dialog does its one thing with them. A thing
     * that takes a moment is the promise returned: until it settles the
     * confirm waits and the dialog cannot be left, and then a refused answer
     * takes the focus (`Form`). The app closes the dialog when the thing is
     * done.
     */
    onConfirm: () => void | Promise<unknown>;
    width?: string;
    /** The fields, and what went wrong with the last submit. */
    children: ReactNode;
}) {
    const [busy, wait] = useWaiting();
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange} busy={busy}>
            <DialogShell open={open} width={width}>
                <Form
                    className="flex min-h-0 flex-col"
                    onSubmit={() => {
                        if (!disabled) return wait(onConfirm());
                    }}
                >
                    <DialogLayout
                        title={title}
                        description={description}
                        actions={
                            <>
                                <DialogCancel disabled={busy} />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={disabled}
                                    busy={busy}
                                >
                                    {confirmLabel}
                                </Button>
                            </>
                        }
                    >
                        {children}
                    </DialogLayout>
                </Form>
            </DialogShell>
        </DialogRoot>
    );
}
