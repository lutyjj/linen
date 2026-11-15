import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { classes } from "../foundation/classes";

/**
 * A setting that takes effect the moment it is turned, such as notifications
 * on or a sync that runs. A checkbox is a choice a form submits later; a
 * switch is a change already made, and its thumb travels to say so.
 */
export function Switch({
    checked,
    onCheckedChange,
    disabled,
    id,
    className,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
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
            className={classes(
                "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border-strong bg-sunken p-px hover:border-text-muted data-[checked]:border-accent data-[checked]:bg-accent data-[disabled]:cursor-default data-[disabled]:opacity-50",
                className,
            )}
        >
            {/* Off, the thumb is a muted mark on the sunken track; on, it
                is the page's own colour on the ink, as a primary button's
                words are, so it reads in both themes. */}
            <BaseSwitch.Thumb className="thumb size-4 rounded-full bg-text-muted data-[checked]:translate-x-4 data-[checked]:bg-bg" />
        </BaseSwitch.Root>
    );
}
