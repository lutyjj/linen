import { Toast as BaseToast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import { m } from "motion/react";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";

import { useWords } from "./words";

/** How long a toast stands, which is also how long undo is on offer. */
export const UNDO_WINDOW_MS = 8000;

export interface ToastMessage {
    text: string;
    onUndo?: () => void;
    /** A named action beside the text, for toasts that offer more than undo. */
    action?: { label: string; run: () => void };
    /** Stays until dismissed or replaced. For failures that need an answer. */
    sticky?: boolean;
    /**
     * Called when the toast leaves unanswered: the person closes it, swipes it
     * away or presses Escape on it, or its time runs out. Not when another
     * replaces it, its own action runs or the app dismisses it: closing a
     * run's toast abandons the run.
     */
    onDismiss?: () => void;
    /** A mark before the text, naming who is speaking. */
    lead?: ReactNode;
    /** How far a run has come, from 0 to 1, drawn as a hairline beneath. */
    progress?: number;
}

interface Toasting {
    show: (message: ToastMessage) => void;
    dismiss: () => void;
}

const ToastContext = createContext<Toasting | undefined>(undefined);

/**
 * One saying: the message, and whether it has been settled by its own action
 * or by the app, which is not the person leaving it unanswered.
 */
interface Saying {
    message: ToastMessage;
    settled: { current: boolean };
}

/**
 * One toast stands at a time, under one id: a new saying takes the standing
 * toast's place, which keeps the keyboard where it was inside it.
 */
const ID = "toast";

/**
 * Which answers a toast offers, in the order it draws them: a new saying
 * that offers others draws other controls, and the one the keyboard was on
 * may go with the old saying.
 */
function answersOf(message: ToastMessage | undefined): string {
    return [
        message?.onUndo !== undefined,
        message?.action !== undefined,
        message?.sticky === true,
    ].join();
}

/**
 * Where toasts stand; `LinenProvider` holds one for the app.
 *
 * Base UI's toast carries the behaviour: its region is read out even while a
 * modal dialog hides the rest of the page, F6 takes the keyboard to it from
 * anywhere and Shift+Tab takes it back, its time rests while a pointer or
 * the keyboard is on it, a swipe or Escape sends it away, and focus returns
 * to where it was when it leaves.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    return (
        <BaseToast.Provider limit={1} timeout={UNDO_WINDOW_MS}>
            <Toaster>{children}</Toaster>
        </BaseToast.Provider>
    );
}

function Toaster({ children }: { children: ReactNode }) {
    const toasts = BaseToast.useToastManager<Saying>();
    const words = useWords();
    const { add, close } = toasts;
    // What stands, for deciding what may take its place.
    const standing = useRef<Saying | undefined>(undefined);

    const show = useCallback(
        (message: ToastMessage) => {
            // A toast offering the only way to answer something stays until
            // it is answered or dismissed: an acknowledgement passing through
            // must not carry the retry off with it. A sticky message is not
            // passing through, so it replaces it, as a run's new progress or
            // its final refusal must. A toast that only says something is
            // displaced like any other, however long it was to stand for.
            if (
                standing.current?.message.action !== undefined &&
                message.action === undefined &&
                message.sticky !== true
            ) {
                return;
            }
            // The keyboard on a control the next saying may not draw rests
            // on the toast itself, which stays.
            const focused = document.activeElement;
            const holding =
                focused instanceof HTMLElement
                    ? focused.closest<HTMLElement>("[data-toast]")
                    : null;
            if (
                holding !== null &&
                holding !== focused &&
                answersOf(standing.current?.message) !== answersOf(message)
            ) {
                holding.focus();
            }
            const saying: Saying = { message, settled: { current: false } };
            standing.current = saying;
            add({
                id: ID,
                timeout: message.sticky ? 0 : UNDO_WINDOW_MS,
                data: saying,
                onClose: () => {
                    if (standing.current === saying)
                        standing.current = undefined;
                    if (!saying.settled.current) message.onDismiss?.();
                },
            });
        },
        [add],
    );

    const dismiss = useCallback(() => {
        if (standing.current !== undefined) {
            standing.current.settled.current = true;
        }
        close(ID);
    }, [close]);

    const toasting = useMemo(() => ({ show, dismiss }), [show, dismiss]);

    return (
        <ToastContext.Provider value={toasting}>
            {children}
            <BaseToast.Portal>
                {/* A press on a toast answers it where the person is, so it
                    takes no focus from the field they were in. Escape in the
                    region is the toasts' own, as a nested Base UI layer keeps
                    its Escape from the layer beneath, so a dialog under a
                    toast stays open. */}
                <BaseToast.Viewport
                    aria-label={words.notifications}
                    onMouseDown={(event) => event.preventDefault()}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") event.stopPropagation();
                    }}
                    className="fixed bottom-[calc(var(--inset-tabbar,0px)_+_env(safe-area-inset-bottom)_+_--spacing(3))] left-1/2 z-60 w-max max-w-[calc(100vw_-_--spacing(6))] -translate-x-1/2 outline-none md:bottom-5 md:max-w-none"
                >
                    {toasts.toasts.map((toast) => (
                        <ToastSurface
                            key={toast.id}
                            toast={toast}
                            onClose={() => close(toast.id)}
                        />
                    ))}
                </BaseToast.Viewport>
            </BaseToast.Portal>
        </ToastContext.Provider>
    );
}

export function useToast(): Toasting {
    const toasting = useContext(ToastContext);
    if (toasting === undefined) {
        throw new Error("useToast needs a ToastProvider above it");
    }
    return toasting;
}

/**
 * Arrives over an entrance and fades as it leaves (motion.css). A new saying
 * replaces the words in place, and its words are new to a reader even when
 * they are the same words.
 */
function ToastSurface({
    toast,
    onClose,
}: {
    toast: BaseToast.Root.ToastObject<Saying>;
    onClose: () => void;
}) {
    const words = useWords();
    const saying = toast.data;
    if (saying === undefined) return null;
    const { message, settled } = saying;
    // A toast is answered once; one on its way out answers nothing more.
    // It closes before the answer runs, so an answer that says something new
    // is not closed with it.
    const answer = (run: () => void) => {
        if (settled.current) return;
        settled.current = true;
        onClose();
        run();
    };
    return (
        <BaseToast.Root
            toast={toast}
            data-toast=""
            className="toast relative flex items-center gap-3 overflow-hidden rounded-card bg-text px-3.5 py-2.5 text-sm text-bg shadow-overlay"
        >
            {message.lead !== undefined && (
                <span className="-mr-1 flex">{message.lead}</span>
            )}
            <BaseToast.Title key={toast.updateKey} render={<span />}>
                {message.text}
            </BaseToast.Title>
            {message.onUndo && (
                <button
                    type="button"
                    className="cursor-pointer font-medium underline underline-offset-2"
                    onClick={() => {
                        const undo = message.onUndo;
                        if (undo !== undefined) answer(undo);
                    }}
                >
                    {words.undo}
                </button>
            )}
            {message.action && (
                <button
                    type="button"
                    className="cursor-pointer font-medium underline underline-offset-2"
                    onClick={() => {
                        const action = message.action;
                        if (action !== undefined) answer(action.run);
                    }}
                >
                    {message.action.label}
                </button>
            )}
            {message.sticky && (
                <BaseToast.Close
                    aria-label={words.dismiss}
                    className="-mr-1 flex size-5 cursor-pointer items-center justify-center rounded-input opacity-60 hover:opacity-100"
                >
                    <X aria-hidden="true" className="size-3.5" />
                </BaseToast.Close>
            )}
            {message.progress !== undefined && (
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-bg/15"
                >
                    <m.span
                        className="block h-full origin-left bg-bg"
                        initial={false}
                        animate={{ scaleX: message.progress }}
                    />
                </span>
            )}
        </BaseToast.Root>
    );
}
