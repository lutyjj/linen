import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Combobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { ChevronDown } from "lucide-react";
import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import { classes } from "./classes";
import { renderLeaving } from "./motion";
import { OPTION_CLASS, POPUP_CLASS, POSITIONER_CLASS } from "./Popup";

/**
 * The frame every field wears, wherever it stands: a form, a table cell, a
 * record's details. Something a hand can change looks changeable at rest, so
 * the frame is always drawn; it is a hairline that firms under the pointer
 * rather than a box that shouts. A popup takes focus off the trigger that
 * opened it, so the open state firms the frame too.
 */
export const CONTROL_CLASS =
    "h-(--height-control) rounded-button border border-border-strong bg-surface px-2.5 text-sm text-text placeholder:text-text-muted hover:border-text-muted data-[popup-open]:border-text-muted";

/** The search box at the top of a picker's list. */
export const POPUP_SEARCH_CLASS = `${CONTROL_CLASS} mb-1 w-full outline-none`;

/**
 * What says a control opens something: a list, or a record's details. One
 * mark for all of them, so a select, a search, an account, and a record read
 * as the same kind of thing. It turns while what it opens is open (`turning`
 * in motion.css), from the state Base UI puts on the control.
 */
export function PickerMark() {
    return (
        <span aria-hidden="true" className="turning flex shrink-0">
            <ChevronDown className="size-3.5 text-text-muted" />
        </span>
    );
}

/** A picker's trigger: its value at the start, its mark at the end. */
export const PICKER_CLASS = `${CONTROL_CLASS} group/picker inline-flex cursor-pointer items-center justify-between gap-1.5 text-left select-none`;

// Shape and skin apart: a box that is marked replaces the resting colours
// rather than layering over them, which two same-property utilities in one
// class list settle by stylesheet order instead.
const CHECK_SHAPE =
    "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-check border align-[-2px]";
const CHECK_RESTING = "border-border-strong bg-surface";
const CHECK_MARKED = "border-accent bg-accent text-bg";

/**
 * A control under its name, with the hint that explains it.
 *
 * A child given as a function is one control, which the name labels. A child
 * given as itself is a group or a popup's own control, and the name is a span:
 * a `label` element forwards clicks inside it to the control it names, which
 * reopens a popup rendered in place rather than choosing from it.
 */
export function Field({
    label,
    hint,
    compact = false,
    width,
    className = "",
    id: named,
    children,
}: {
    label: string;
    hint?: ReactNode;
    /** For a tight place, such as inside another popup. */
    compact?: boolean;
    /**
     * A name of the caller's choosing, for a control something outside the
     * form has to reach, such as the question a submit puts the cursor back on.
     */
    id?: string;
    /**
     * How much room the control needs, in the spacing scale's own steps. A
     * field that states its own width does not need a box drawn around it to
     * hold one, and a row of them lines up because they were asked to.
     */
    width?: number;
    className?: string;
    children: ReactNode | ((id: string) => ReactNode);
}) {
    const generated = useId();
    const id = named ?? generated;
    const labels = typeof children === "function";
    const Name = labels ? "label" : "span";
    return (
        <div
            data-field
            // A stated width is what the field asks for, up to the width it is
            // given. Held against that width, it is not the least room the
            // field needs, so a grid that holds it can be as narrow as a phone.
            style={
                width === undefined
                    ? undefined
                    : { width: `min(calc(var(--spacing) * ${width}), 100%)` }
            }
            className={classes(
                "min-w-0 max-w-full",
                compact ? "" : "mb-4",
                className,
            )}
        >
            <Name
                {...(labels ? { htmlFor: id } : {})}
                className={classes(
                    "mb-1 block",
                    compact
                        ? "text-xs text-text-secondary"
                        : "text-sm font-medium",
                )}
            >
                {label}
            </Name>
            {labels ? children(id) : children}
            {hint !== undefined && (
                <p className="mt-1 text-xs text-text-secondary">{hint}</p>
            )}
        </div>
    );
}

/**
 * Fields and their action side by side on one baseline.
 *
 * The row owns the vertical rhythm its fields normally carry, so a labelled
 * field, a control, and the button that submits them share a bottom edge
 * instead of each solving alignment alone.
 */
export function FieldRow({ children }: { children: ReactNode }) {
    return (
        // Its fields give way to the column it stands in rather than hold
        // the column open, so a row of fields fits a phone.
        <div className="flex min-w-0 flex-wrap items-end gap-3 [&_[data-field]]:mb-0">
            {children}
        </div>
    );
}

export interface Choice {
    value: string;
    label: string;
}

/**
 * Choices under a heading, where a list holds things of more than one kind,
 * such as teams and people.
 */
export interface ChoiceGroup {
    label: string;
    choices: readonly Choice[];
}

function isGroup(entry: Choice | ChoiceGroup): entry is ChoiceGroup {
    return "choices" in entry;
}

export function CellSelect({
    choices,
    placeholder,
    value,
    onValueChange,
    disabled,
    invalid,
    inline = false,
    className = "",
    id,
    "aria-label": ariaLabel,
}: {
    /**
     * Plain choices, and groups of them under a heading, listed in this
     * order.
     */
    choices: readonly (Choice | ChoiceGroup)[];
    /** Shown for the empty value, and choosing it clears the selection. */
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    invalid?: boolean;
    /**
     * Render the popup in place instead of a portal. Required inside another
     * popup, whose dismissal treats a portalled click as an outside press.
     */
    inline?: boolean;
    className?: string;
    id?: string;
    "aria-label"?: string;
}) {
    const entries: readonly (Choice | ChoiceGroup)[] =
        placeholder === undefined
            ? choices
            : [{ value: "", label: placeholder }, ...choices];
    const items = entries.flatMap((entry) =>
        isGroup(entry) ? entry.choices : [entry],
    );
    const chosen = items.find((item) => item.value === value);
    const unchosen = (list: readonly Choice[]) =>
        list.filter((item) => item !== chosen);

    const option = (item: Choice) => (
        <BaseSelect.Item
            key={item.value}
            value={item.value}
            className={classes(
                "cursor-pointer rounded-input px-2 py-1.5 data-[highlighted]:bg-accent-weak data-[highlighted]:text-accent data-[selected]:font-medium",
                item.value === "" ? "text-text-secondary" : "",
            )}
        >
            <BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
        </BaseSelect.Item>
    );

    const positioned = (
        <BaseSelect.Positioner
            sideOffset={4}
            align="start"
            alignItemWithTrigger={false}
            className={POSITIONER_CLASS}
        >
            <BaseSelect.Popup
                render={renderLeaving}
                className={classes(
                    POPUP_CLASS,
                    "flex max-h-72 min-w-[var(--anchor-width)] flex-col",
                )}
            >
                <BaseSelect.Arrow className="absolute" />
                {chosen !== undefined && (
                    <div className="mb-1 shrink-0 border-b border-border pb-1">
                        {option(chosen)}
                    </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {entries.map((entry) => {
                        if (!isGroup(entry)) {
                            return entry === chosen ? null : option(entry);
                        }
                        const rest = unchosen(entry.choices);
                        // A heading over nothing would only say the kind is
                        // empty, which the list already shows.
                        if (rest.length === 0) return null;
                        return (
                            <BaseSelect.Group
                                key={`group:${entry.label}`}
                                className="mt-1 border-t border-border pt-1 first:mt-0 first:border-t-0 first:pt-0"
                            >
                                <BaseSelect.GroupLabel className="px-2 pt-1 pb-0.5 text-xs text-text-muted">
                                    {entry.label}
                                </BaseSelect.GroupLabel>
                                {rest.map(option)}
                            </BaseSelect.Group>
                        );
                    })}
                </div>
            </BaseSelect.Popup>
        </BaseSelect.Positioner>
    );
    return (
        <BaseSelect.Root
            items={items}
            value={value}
            // Choosing what is already chosen is not a change. The popup lifts
            // the held value to the top of its own list, so it is the easiest
            // thing in there to press, and every press of it wrote and said so.
            onValueChange={(next: string | null) => {
                if ((next ?? "") !== value) onValueChange(next ?? "");
            }}
            disabled={disabled}
            modal={false}
        >
            <BaseSelect.Trigger
                id={id}
                aria-label={ariaLabel}
                data-invalid={invalid === true || undefined}
                className={classes(
                    PICKER_CLASS,
                    "data-[disabled]:cursor-default data-[disabled]:opacity-50 data-[invalid]:border-warn data-[invalid]:text-warn",
                    value === "" ? "text-text-secondary" : "",
                    className,
                )}
            >
                <BaseSelect.Value className="truncate" />
                <PickerMark />
            </BaseSelect.Trigger>
            {inline ? (
                positioned
            ) : (
                <BaseSelect.Portal>{positioned}</BaseSelect.Portal>
            )}
        </BaseSelect.Root>
    );
}

export function Select({
    label,
    hint,
    width,
    className = "",
    ...rest
}: {
    label: string;
    hint?: ReactNode;
    width?: number;
    className?: string;
} & Omit<Parameters<typeof CellSelect>[0], "id" | "className">) {
    return (
        <Field label={label} hint={hint} width={width}>
            {(id) => (
                <CellSelect
                    id={id}
                    className={classes("w-full", className)}
                    {...rest}
                />
            )}
        </Field>
    );
}

/**
 * One value out of a list nobody can scan, such as the world's currencies,
 * with the search box that makes it scannable. It only chooses: a picker that
 * also creates what was typed is the app's own.
 */
export function SearchSelect({
    label,
    hint,
    placeholder,
    searchLabel,
    choices,
    value,
    onValueChange,
    id,
}: {
    label: string;
    hint?: ReactNode;
    placeholder: string;
    searchLabel: string;
    choices: readonly Choice[];
    value: string;
    onValueChange: (value: string) => void;
    id?: string;
}) {
    const [open, setOpen] = useState(false);
    const chosen = choices.find((choice) => choice.value === value);

    return (
        <Field label={label} hint={hint} id={id}>
            {(named) => (
                <Combobox.Root
                    items={choices}
                    autoHighlight
                    open={open}
                    onOpenChange={setOpen}
                    value={chosen ?? null}
                    onValueChange={(next: Choice | null) => {
                        if (next === null) return;
                        onValueChange(next.value);
                        setOpen(false);
                    }}
                >
                    <Combobox.Trigger
                        id={named}
                        className={classes(
                            PICKER_CLASS,
                            "flex w-full",
                            chosen === undefined ? "text-text-secondary" : "",
                        )}
                        onClick={() => setOpen(true)}
                    >
                        <span className="truncate">
                            {chosen?.label ?? placeholder}
                        </span>
                        <PickerMark />
                    </Combobox.Trigger>
                    <Combobox.Portal>
                        <Combobox.Positioner
                            sideOffset={4}
                            align="start"
                            className={POSITIONER_CLASS}
                        >
                            <Combobox.Popup
                                render={renderLeaving}
                                aria-label={label}
                                className={classes(
                                    POPUP_CLASS,
                                    "w-[var(--anchor-width)] min-w-64",
                                )}
                            >
                                <Combobox.Arrow className="absolute" />
                                <Combobox.Input
                                    aria-label={searchLabel}
                                    placeholder={searchLabel}
                                    className={POPUP_SEARCH_CLASS}
                                />
                                <Combobox.List className="max-h-56 overflow-y-auto">
                                    {(choice: Choice) => (
                                        <Combobox.Item
                                            key={choice.value}
                                            value={choice}
                                            className={OPTION_CLASS}
                                        >
                                            {choice.label}
                                        </Combobox.Item>
                                    )}
                                </Combobox.List>
                            </Combobox.Popup>
                        </Combobox.Positioner>
                    </Combobox.Portal>
                </Combobox.Root>
            )}
        </Field>
    );
}

function CheckIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.5 6.5 5 9l4.5-5.5" />
        </svg>
    );
}

/**
 * A box that is ticked, and the words that say what ticking it does.
 *
 * The words are part of the control rather than a `label` pointing at it: the
 * element a library renders for the box is not the one a person presses, so a
 * label aimed at it names something invisible and clicking the words does
 * nothing. Given no children the box carries its name in `aria-label`, which is
 * the shape a table column takes, where the heading is the words.
 */
export function Checkbox({
    checked,
    onCheckedChange,
    disabled,
    secondary = false,
    className = "",
    "aria-label": ariaLabel,
    children,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    /** Secondary ink for the words, where the box is an aside to a form. */
    secondary?: boolean;
    className?: string;
    "aria-label"?: string;
    children?: ReactNode;
}) {
    const box = (
        <span
            aria-hidden="true"
            className={classes(
                CHECK_SHAPE,
                CHECK_RESTING,
                "text-bg group-data-[checked]:border-accent group-data-[checked]:bg-accent",
            )}
        >
            <BaseCheckbox.Indicator>
                <CheckIcon />
            </BaseCheckbox.Indicator>
        </span>
    );
    return (
        <BaseCheckbox.Root
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={ariaLabel}
            className={classes(
                "group inline-flex cursor-pointer items-center gap-2 text-left text-sm data-[disabled]:cursor-default data-[disabled]:opacity-50",
                children === undefined ? "" : "w-full",
                secondary ? "text-text-secondary hover:text-text" : "",
                className,
            )}
        >
            {box}
            {children}
        </BaseCheckbox.Root>
    );
}

/**
 * The control that selects a row, or every row, wherever a list can be acted
 * on in bulk.
 *
 * A checkbox by role rather than by shape, so the count the selection bar
 * states is reachable by name, and one padded hit target so a thumb can find
 * it in a table row that is 36px tall.
 */
export function SelectToggle({
    label,
    checked,
    indeterminate = false,
    disabled = false,
    onToggle,
}: {
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    /** Told whether the press asked for a range, with Shift held. */
    onToggle: (extend: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked ? true : indeterminate ? "mixed" : false}
            aria-label={label}
            disabled={disabled}
            onClick={(event) => onToggle(event.shiftKey)}
            className="-m-2 cursor-pointer p-2 disabled:cursor-default disabled:opacity-45"
        >
            <CheckGlyph checked={checked} indeterminate={indeterminate} />
        </button>
    );
}

/** The checkbox visual alone, for rows whose selection the row itself owns. */
export function CheckGlyph({
    checked,
    indeterminate = false,
}: {
    checked: boolean;
    indeterminate?: boolean;
}) {
    const marked = checked || indeterminate;
    return (
        <span
            aria-hidden="true"
            className={classes(
                CHECK_SHAPE,
                marked ? CHECK_MARKED : CHECK_RESTING,
            )}
        >
            {indeterminate ? (
                <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path d="M3 6h6" />
                </svg>
            ) : checked ? (
                <CheckIcon />
            ) : null}
        </span>
    );
}

export function TextField({
    label,
    hint,
    width,
    className = "",
    id: named,
    ...rest
}: {
    label: string;
    hint?: ReactNode;
    width?: number;
} & Parameters<typeof CellInput>[0]) {
    return (
        <Field label={label} hint={hint} width={width} id={named}>
            {(id) => (
                <CellInput
                    id={id}
                    className={classes("w-full", className)}
                    {...rest}
                />
            )}
        </Field>
    );
}

/** How long typing pauses before what was typed is handed on. */
const SETTLE_MS = 250;

/**
 * A box that narrows a list, holding what is typed and handing it on once
 * typing pauses.
 *
 * The buffer is the point: a search that answers on every keystroke re-runs
 * whatever reads it a dozen times for one word, and where that answer changes
 * the page (a count, a chip, a row of results), it changes it under the
 * cursor. What is held is replaced whenever the value arrives from elsewhere,
 * so a cleared filter or a followed link still shows in the box.
 */
export const SearchField = forwardRef<
    HTMLInputElement,
    {
        /** The control's accessible name. Search boxes carry no visible label. */
        label: string;
        value: string;
        onChange: (value: string) => void;
        /**
         * Enter was pressed: what is typed is handed on at once, and then to
         * this as well, for a list that can do more with a finished search.
         */
        onSubmit?: (value: string) => void;
        placeholder?: string;
        className?: string;
    }
>(function SearchField(
    { label, value, onChange, onSubmit, placeholder, className = "" },
    ref,
) {
    const [typed, setTyped] = useState(value);
    const settle = useRef(onChange);
    settle.current = onChange;
    // What this box last handed on. The value comes back through the props a
    // render later, and taking that echo as news would put it back in the box
    // over whatever has been typed since.
    const handedOn = useRef(value);

    useEffect(() => {
        if (value === handedOn.current) return;
        handedOn.current = value;
        setTyped(value);
    }, [value]);

    useEffect(() => {
        if (typed === handedOn.current) return;
        const timer = setTimeout(() => {
            handedOn.current = typed;
            settle.current(typed);
        }, SETTLE_MS);
        return () => clearTimeout(timer);
    }, [typed]);

    return (
        <input
            ref={ref}
            aria-label={label}
            className={classes(
                CONTROL_CLASS,
                "placeholder:text-text-muted",
                className,
            )}
            placeholder={placeholder}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
                if (event.key !== "Enter" || onSubmit === undefined) return;
                if (typed !== handedOn.current) {
                    handedOn.current = typed;
                    settle.current(typed);
                }
                onSubmit(typed);
            }}
        />
    );
});

/**
 * A bare control for use inside a table cell, where the column is the label.
 *
 * A unit, when the value has one, is part of the field rather than words
 * floating beside it: it sits inside the frame, after the value, so "120" and
 * "seconds" read as one answer and move as one when the row wraps.
 */
export function CellInput({
    className = "",
    unit,
    ...rest
}: InputHTMLAttributes<HTMLInputElement> & { unit?: ReactNode }) {
    if (unit === undefined) {
        return (
            <input className={classes(CONTROL_CLASS, className)} {...rest} />
        );
    }
    return (
        <span
            className={classes(
                CONTROL_CLASS,
                "inline-flex cursor-text items-center gap-1.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent",
                className,
            )}
        >
            <input
                className="h-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-text-muted"
                {...rest}
            />
            <span aria-hidden="true" className="shrink-0 text-text-muted">
                {unit}
            </span>
        </span>
    );
}

/**
 * Text corrected where it is read, written when the field is left.
 *
 * Enter writes and Escape puts the held value back, so a field in a long
 * column is edited without a button beside every row.
 */
export function CellText({
    label,
    value,
    draft,
    onCommit,
    onDiscard,
    clearable = false,
    placeholder,
    unit,
    className = "",
}: {
    label: string;
    value: string;
    /**
     * Text to start from instead of the held value, such as a proposal
     * opened to change. The field takes the cursor, and leaving it writes.
     */
    draft?: string;
    /** Rejected by resolving to false, which puts the held value back. */
    onCommit: (value: string) => Promise<boolean>;
    /** The field was left without writing, so a draft it started from is spent. */
    onDiscard?: () => void;
    /** Whether emptying the box is an answer. */
    clearable?: boolean;
    placeholder?: string;
    unit?: ReactNode;
    className?: string;
}) {
    const [text, setText] = useState(draft ?? value);
    useEffect(() => setText(draft ?? value), [value, draft]);

    function commit() {
        const wanted = text.trim();
        if ((wanted === "" && !clearable) || wanted === value) {
            setText(value);
            onDiscard?.();
            return;
        }
        void onCommit(wanted).then((kept) => {
            if (!kept) setText(value);
        });
    }

    return (
        <CellInput
            aria-label={label}
            className={className}
            placeholder={placeholder}
            unit={unit}
            value={text}
            autoFocus={draft !== undefined}
            onChange={(event) => setText(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") setText(value);
            }}
        />
    );
}

/**
 * A setting that takes effect the moment it is turned: AI on, a model that
 * thinks. A checkbox is a choice a form submits later; a switch is a change
 * already made, and its thumb travels to say so.
 */
export function Switch({
    checked,
    onCheckedChange,
    disabled,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    "aria-label"?: string;
    "aria-describedby"?: string;
}) {
    return (
        <BaseSwitch.Root
            id={id}
            checked={checked}
            onCheckedChange={(next) => onCheckedChange(next)}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            className="inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border-strong bg-sunken p-px hover:border-text-muted data-[checked]:border-accent data-[checked]:bg-accent data-[disabled]:cursor-default data-[disabled]:opacity-50"
        >
            {/* Off, the thumb is a muted mark on the sunken track; on, it
                is the page's own colour on the ink, as a primary button's
                words are, so it reads in both themes. */}
            <BaseSwitch.Thumb className="thumb size-4 rounded-full bg-text-muted data-[checked]:translate-x-4 data-[checked]:bg-bg" />
        </BaseSwitch.Root>
    );
}
