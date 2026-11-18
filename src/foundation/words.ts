import { createContext, use } from "react";

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
    /** Under a secret shown once, where the app says nothing of its own. */
    shownOnce: string;
    expandRail: string;
    collapseRail: string;
    remove: string;
    /** Said after a step of a task that is done. */
    done: string;
    /** Saves a block of text as a file. */
    download: string;
    /** Brings a block of text that grows back to its newest lines. */
    latestLines: string;
    /**
     * A gauge's value in words, read out with each mark on its bar by its
     * label, such as "-12 dB, Peak -3 dB, Limit -6 dB".
     */
    gaugeReading: (
        value: string,
        marks: readonly { label: string; value: string }[],
    ) => string;
    /** A number field's step up and step down. */
    increase: string;
    decrease: string;
    /** The trail of screens above the one shown, before its title. */
    breadcrumb: string;
    /** The button a trail folds its outer steps behind. */
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
        "It is shown once and is not kept, so make another if it is lost.",
    expandRail: "Expand sidebar",
    collapseRail: "Collapse sidebar",
    remove: "Remove",
    done: "done",
    download: "Download",
    latestLines: "Latest lines",
    gaugeReading: (value, marks) =>
        [value, ...marks.map((mark) => `${mark.label} ${mark.value}`)].join(
            ", ",
        ),
    increase: "Increase",
    decrease: "Decrease",
    breadcrumb: "Breadcrumb",
    foldedSteps: "More screens above",
    leaveUnsaved: "Leave without saving?",
    leave: "Leave",
    unsavedLost: (names) =>
        names.length === 0
            ? "Unsaved changes are lost."
            : `Unsaved changes to ${new Intl.ListFormat("en", { type: "conjunction" }).format(names)} are lost.`,
};

export const WordsContext = createContext<Words>(ENGLISH);

export function useWords(): Words {
    return use(WordsContext);
}
