import { Dialog } from "@base-ui/react/dialog";
import { usePresence } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

import { renderLeaving } from "./motion";

/**
 * Every popup's surface. `popup` is its motion (motion.css): it grows
 * out of the control that opened it and leaves toward it, and Base UI keeps
 * it until it has. Each popup holds its part's `Arrow`, drawn at no size:
 * with one, Base UI names the middle of the control's facing edge as the
 * popup's `--transform-origin`, wherever a collision has moved the popup.
 * It is never wider than the room its positioner finds on the screen
 * (`--available-width`), so a long choice wraps instead of running off it.
 */
export const POPUP_CLASS =
    "popup max-w-(--available-width) rounded-card border border-border bg-surface p-1 text-sm shadow-overlay outline-none";

/**
 * Every popup rides on a positioner, and the stacking order belongs there: the
 * popup itself is statically positioned, so a z-index on it does nothing while
 * the sticky table headers it must clear carry one of their own.
 */
export const POSITIONER_CLASS = "z-50";

/** One choice in a popup's list, highlighted and disabled the same way in every picker. */
export const OPTION_CLASS =
    "cursor-pointer rounded-input px-2 py-1.5 data-[highlighted]:bg-accent-weak data-[highlighted]:text-accent data-[disabled]:cursor-default data-[disabled]:opacity-50";

/**
 * A dialog's root. It is open while its caller holds it open and while it is
 * still on the page: a caller that closes a dialog by unmounting it, inside
 * `AnimatePresence`, still sees it leave, and it goes when Base UI says the
 * leaving is done.
 */
export function DialogRoot({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}) {
    const [present, safeToRemove] = usePresence();
    // At rest closed: never opened, or Base UI has finished its exit. A shut
    // dialog has nothing to wait for when the part of the page around it goes.
    const [shut, setShut] = useState(!open);
    if (open && shut) setShut(false);
    useEffect(() => {
        if (!present && shut) safeToRemove();
    }, [present, shut, safeToRemove]);
    return (
        <Dialog.Root
            open={open && present}
            onOpenChange={onOpenChange}
            onOpenChangeComplete={(opened) => {
                if (opened) return;
                setShut(true);
                if (!present) safeToRemove();
            }}
        >
            {children}
        </Dialog.Root>
    );
}

/**
 * The centred modal surface every dialog shares: backdrop, panel, and the
 * dialog radius. What the dialog asks is the caller's; how one sits on the
 * screen, and how it arrives and leaves (motion.css), is not.
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
    const [said, setSaid] = useState(children);
    if (open && said !== children) setSaid(children);
    return (
        <Dialog.Portal>
            <Dialog.Backdrop className="dialog-backdrop fixed inset-0 z-40 bg-scrim" />
            <Dialog.Popup
                render={renderLeaving}
                style={{ width: `min(${width}, 90vw)` }}
                className="dialog fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-dialog border border-border bg-surface p-5 shadow-overlay outline-none"
            >
                {open ? children : said}
            </Dialog.Popup>
        </Dialog.Portal>
    );
}
