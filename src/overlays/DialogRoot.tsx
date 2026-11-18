import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { usePresence } from "motion/react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { renderLeaving } from "../foundation/popup";
import { useVisibleViewport } from "../foundation/viewport";

/**
 * A dialog's root. It is open while its caller holds it open and while it is
 * still on the page: a caller that closes a dialog by unmounting it, inside
 * `AnimatePresence`, still sees it leave, and it goes when Base UI says the
 * leaving is done.
 */
export function DialogRoot({
    open,
    onOpenChange,
    busy = false,
    alert = false,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Escape and a press beside it leave the dialog standing while set. */
    busy?: boolean;
    /**
     * Base UI's alert dialog, for an act to confirm: a press beside it does
     * not dismiss it.
     */
    alert?: boolean;
    children: ReactNode;
}) {
    // At rest closed: never opened, or Base UI has finished its exit. A shut
    // dialog has nothing to wait for when the part of the page around it
    // goes, so only an open one asks to be waited for.
    const [shut, setShut] = useState(!open);
    if (open && shut) setShut(false);
    const [present, safeToRemove] = usePresence(!shut);
    const Root = alert ? AlertDialog.Root : Dialog.Root;
    return (
        <Root
            open={open && present}
            onOpenChange={(next) => {
                if (!next && busy) return;
                onOpenChange(next);
            }}
            onOpenChangeComplete={(opened) => {
                if (opened) return;
                setShut(true);
                if (!present) safeToRemove();
            }}
        >
            {children}
        </Root>
    );
}

/**
 * The centred modal surface every dialog shares: backdrop, panel, and the
 * dialog radius. What the dialog asks is the caller's; how one sits on the
 * screen, and how it arrives and leaves (motion.css), is not. It stands in
 * the part of the window a person can see, an on-screen keyboard's room
 * taken out, and never grows past it: its `DialogLayout` keeps to the room
 * it gives, `--dialog-room`, whatever stands between them, such as a `Form`
 * or an app's own wrapper, and scrolls what lies between the title and the
 * actions.
 *
 * A dialog keeps the words it was open with while it leaves. Its caller often
 * forgets what the dialog was about the moment it closes, and a title that
 * lost its name halfway through fading out reads as a fault.
 */
export function DialogShell({
    open,
    width = "28rem",
    children,
}: {
    open: boolean;
    width?: string;
    children: ReactNode;
}) {
    // The words it last showed open, kept once they reach the page; they
    // change nothing there until the dialog leaves, so they need no render
    // of their own.
    const said = useRef(children);
    useLayoutEffect(() => {
        if (open) said.current = children;
    });
    const visible = useVisibleViewport();
    return (
        <Dialog.Portal>
            <Dialog.Backdrop className="dialog-backdrop fixed inset-0 z-40 bg-scrim" />
            {/* The viewport is the container the room is measured in: 100cqh
                is its height inside its padding, and the popup takes its own
                padding and border from it. */}
            <Dialog.Viewport
                ref={visible}
                className="@container-size fixed inset-x-0 top-(--visible-top,0px) z-50 flex h-(--visible-height,100dvh) items-center justify-center px-4 pt-[calc(var(--inset-top)+--spacing(4))] pb-[calc(env(safe-area-inset-bottom)+--spacing(4))]"
            >
                <Dialog.Popup
                    render={renderLeaving}
                    style={{ width: `min(${width}, 100%)` }}
                    className="dialog rounded-dialog border border-border bg-surface p-5 shadow-overlay outline-none [--dialog-room:calc(100cqh-2*(--spacing(5)+1px))]"
                >
                    {open ? children : said.current}
                </Dialog.Popup>
            </Dialog.Viewport>
        </Dialog.Portal>
    );
}
