import { Dialog } from "@base-ui/react/dialog";
import type { FormEvent, ReactNode } from "react";

import { Actions, Button } from "./Button";
import { DialogRoot, DialogShell } from "./Popup";
import { useWords } from "./words";

/**
 * What every dialog lays out the same way: its title, what it is about, what
 * it asks, and its actions at the end, the one it exists for last.
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
            <Dialog.Title className="text-md font-semibold">
                {title}
            </Dialog.Title>
            {description !== undefined && (
                <Dialog.Description className="mt-1.5 text-sm text-text-secondary">
                    {description}
                </Dialog.Description>
            )}
            {children !== undefined && <div className="mt-4">{children}</div>}
            <Actions className="mt-5 justify-end">{actions}</Actions>
        </>
    );
}

/** The way out of a dialog, which changes nothing. */
export function DialogCancel({ label }: { label?: string }) {
    const words = useWords();
    return <Dialog.Close render={<Button>{label ?? words.cancel}</Button>} />;
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
    submitLabel,
    disabled = false,
    onSubmit,
    width,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    submitLabel: string;
    disabled?: boolean;
    onSubmit: () => void;
    width?: string;
    /** The fields, and what went wrong with the last submit. */
    children: ReactNode;
}) {
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!disabled) onSubmit();
    };
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogShell open={open} width={width}>
                <form onSubmit={submit}>
                    <DialogLayout
                        title={title}
                        description={description}
                        actions={
                            <>
                                <DialogCancel />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={disabled}
                                >
                                    {submitLabel}
                                </Button>
                            </>
                        }
                    >
                        {children}
                    </DialogLayout>
                </form>
            </DialogShell>
        </DialogRoot>
    );
}
