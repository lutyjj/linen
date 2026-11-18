import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

import { Actions, Button } from "../controls/Button";
import { Form, type FormErrors } from "../fields/Form";
import { useWaiting } from "../foundation/waiting";
import { useWords } from "../foundation/words";
import { DialogRoot, DialogShell } from "./DialogRoot";

/**
 * What every dialog lays out the same way: its title, what it is about, what
 * it asks, and its actions at the end, the one it exists for last. A dialog
 * holds one, since its title names the dialog: one that moves on to another
 * view keeps it, its title and actions changing with the view and its body
 * swapping with a `stepped` `Swap`. It keeps to the room its `DialogShell`
 * gives, whatever stands between them, such as a `Form` or an app's own
 * wrapper: in a window too short for all of it, the title and the actions
 * keep their places and what lies between them scrolls.
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
        <div className="flex max-h-(--dialog-room) flex-col">
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
        </div>
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
    errors,
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
    /** Why the answers were refused, by field `name`, as a `Form` takes them. */
    errors?: FormErrors;
    /**
     * The answers are given; the dialog does its one thing with them. A thing
     * that takes a moment is the promise returned: until it settles the
     * confirm waits and the dialog cannot be left, and then a refused answer
     * takes the focus (`Form`). The app closes the dialog when the thing is
     * done.
     */
    onConfirm: () => void | Promise<unknown>;
    width?: string;
    /** The fields, and a notice of what failed with the last submit. */
    children: ReactNode;
}) {
    const [busy, wait] = useWaiting();
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange} busy={busy}>
            <DialogShell open={open} width={width}>
                <Form
                    errors={errors}
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
