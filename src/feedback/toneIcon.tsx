import {
    CircleAlert,
    CircleCheck,
    Info,
    LoaderCircle,
    type LucideIcon,
    TriangleAlert,
} from "lucide-react";

import { classes } from "../foundation/classes";
import { type Tone, TONE_INK } from "../foundation/tone";

const ICON: Record<Tone, LucideIcon> = {
    accent: Info,
    positive: CircleCheck,
    warn: TriangleAlert,
    danger: CircleAlert,
};

/**
 * The mark a message in a tone leads with, in the tone's ink. While what
 * it says is under way, a mark that turns stands in its place.
 */
export function ToneIcon({
    tone,
    active = false,
    className,
}: {
    tone: Tone;
    active?: boolean;
    className?: string;
}) {
    const Icon = active ? LoaderCircle : ICON[tone];
    return (
        <span
            aria-hidden="true"
            className={classes(
                "flex shrink-0",
                TONE_INK[tone],
                active && "refresh-turning",
                className,
            )}
        >
            <Icon className="size-4" />
        </span>
    );
}
