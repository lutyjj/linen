import { createContext, type ReactNode, use } from "react";

import { MotionProvider } from "./motion";
import { ToastProvider } from "./Toast";

/**
 * The few words the components say on their own: a dialog's way out, a
 * toast's undo, the result of a copy. Everything else a component shows, the
 * caller hands it. An app that speaks another language, or several, gives the
 * provider its own.
 */
export interface Words {
    cancel: string;
    undo: string;
    dismiss: string;
    /** The toasts' region, which names the key that reaches it. */
    notifications: string;
    copy: string;
    copied: string;
    /** The browser refused the clipboard, so the text has to be taken by hand. */
    copyRefused: string;
    /** Under a secret the server shows once and keeps only a hash of. */
    shownOnce: string;
    expandRail: string;
    collapseRail: string;
    remove: string;
    /** The trail of screens above the one shown, over its title. */
    breadcrumb: string;
    /** The button a deep trail folds its outer steps behind. */
    foldedSteps: string;
    /** The question before leaving work that is not saved. */
    leaveUnsaved: string;
    /** The answer that leaves it. */
    leave: string;
    /** What leaving loses, given what each unsaved draft calls itself, such as
     * "the profile"; none when no draft named itself. */
    unsavedLost: (names: readonly string[]) => string;
}

export const ENGLISH: Words = {
    cancel: "Cancel",
    undo: "Undo",
    dismiss: "Dismiss",
    notifications: "Notifications (F6)",
    copy: "Copy",
    copied: "Copied",
    copyRefused:
        "This browser blocked the copy. Select the text and copy it yourself.",
    shownOnce:
        "It is shown once and is not stored, so create another if it is lost.",
    expandRail: "Expand sidebar",
    collapseRail: "Collapse sidebar",
    remove: "Remove",
    breadcrumb: "Breadcrumb",
    foldedSteps: "More screens above",
    leaveUnsaved: "Leave without saving?",
    leave: "Leave",
    unsavedLost: (names) =>
        names.length === 0
            ? "Unsaved changes are lost."
            : `Unsaved changes to ${new Intl.ListFormat("en", { type: "conjunction" }).format(names)} are lost.`,
};

const WordsContext = createContext<Words>(ENGLISH);

export function useWords(): Words {
    return use(WordsContext);
}

/**
 * Everything the components share above them: their words, one clock for
 * every animation, and the place toasts stand.
 */
export function LinenProvider({
    words = ENGLISH,
    children,
}: {
    words?: Words;
    children: ReactNode;
}) {
    return (
        <WordsContext value={words}>
            <MotionProvider>
                <ToastProvider>{children}</ToastProvider>
            </MotionProvider>
        </WordsContext>
    );
}
