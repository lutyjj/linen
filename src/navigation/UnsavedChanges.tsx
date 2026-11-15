import {
    createContext,
    type ReactNode,
    use,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { useWords } from "../foundation/words";
import { ConfirmDialog } from "../overlays/ConfirmDialog";
import { useNavigation } from "./navigation";

/** Work on the page that a person keeps by pressing save. */
interface Draft {
    unsaved: boolean;
    pending: boolean;
    name: string | undefined;
}

interface Drafts {
    set: (id: string, draft: Draft) => void;
    delete: (id: string) => void;
}

const DraftsContext = createContext<Drafts | null>(null);

/**
 * Asks before the person leaves unsaved work: moving to another page of the
 * app asks in a dialog that names what is lost, and closing or reloading the
 * tab asks through the browser. Every draft below it reports itself with
 * `useUnsavedChanges`, so one page may hold several. It stands once, around
 * the pages, and holds moves within the app through the navigation's
 * `useBlocker`; a navigation without one leaves only the browser's question.
 */
export function UnsavedChangesGuard({ children }: { children: ReactNode }) {
    const words = useWords();
    const drafts = useRef(new Map<string, Draft>());
    const [anyUnsaved, setAnyUnsaved] = useState(false);
    const registry = useMemo<Drafts>(() => {
        const tally = () =>
            setAnyUnsaved(
                [...drafts.current.values()].some((draft) => draft.unsaved),
            );
        return {
            set: (id, draft) => {
                drafts.current.set(id, draft);
                tally();
            },
            delete: (id) => {
                drafts.current.delete(id);
                tally();
            },
        };
    }, []);
    // A draft whose own save or delete is under way lets the app move on, as
    // that act may itself lead to another page.
    const holding = () =>
        [...drafts.current.values()].filter(
            (draft) => draft.unsaved && !draft.pending,
        );
    const { usePathname, useBlocker } = useNavigation();
    const here = usePathname();
    const blocker = useBlocker((next) => next !== here && holding().length > 0);

    // Closing the tab asks while any work is unsaved, pending or not: a save
    // under way may still fail. The listener is there only then, so the page
    // stays eligible for the browser's back-forward cache otherwise.
    useEffect(() => {
        if (!anyUnsaved) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [anyUnsaved]);

    // The dialog closes after its confirmation too, and that close must not
    // call the move off; each new question starts undecided.
    const leaving = useRef(false);
    const blocked = blocker.blocked;
    useEffect(() => {
        if (blocked) leaving.current = false;
    }, [blocked]);
    const names = blocked
        ? holding().flatMap((draft) => (draft.name ? [draft.name] : []))
        : [];

    return (
        <DraftsContext value={registry}>
            {children}
            <ConfirmDialog
                open={blocked}
                onOpenChange={(open) => {
                    if (open || leaving.current) return;
                    blocker.reset();
                }}
                title={words.leaveUnsaved}
                description={words.unsavedLost(names)}
                confirmLabel={words.leave}
                destructive
                onConfirm={() => {
                    leaving.current = true;
                    blocker.proceed();
                }}
            />
        </DraftsContext>
    );
}

/**
 * Reports a draft to the `UnsavedChangesGuard` above it: `unsaved` while it
 * holds work its save button has not kept. While `pending` (its save, or
 * another act that settles it such as a delete, is under way) the app may
 * move on without asking; closing the tab still asks. `name` says what the
 * work is, such as "the profile", in the guard's question.
 */
export function useUnsavedChanges(
    unsaved: boolean,
    { name, pending = false }: { name?: string; pending?: boolean } = {},
) {
    const drafts = use(DraftsContext);
    if (drafts === null) {
        throw new Error(
            "useUnsavedChanges needs an UnsavedChangesGuard above it",
        );
    }
    const id = useId();
    useEffect(() => {
        drafts.set(id, { unsaved, pending, name });
    }, [drafts, id, unsaved, pending, name]);
    useEffect(() => () => drafts.delete(id), [drafts, id]);
}
