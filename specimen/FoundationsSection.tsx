import { Button, ChipTrigger, SCREEN_TITLE_CLASS } from "../src";
import { Group, Sample, Samples, Specimen, Stack } from "./Specimen";

interface Swatch {
    token: string;
    name: string;
    says?: string;
}

const INKS: readonly Swatch[] = [
    { token: "--color-ink", name: "Ink", says: "Press here, set by a hand" },
    { token: "--color-positive", name: "Positive", says: "Gained, arrived" },
    { token: "--color-danger", name: "Danger", says: "Removed, failed" },
    { token: "--color-warn", name: "Caution", says: "Unfinished, unanswered" },
];

const PAPER: readonly Swatch[] = [
    { token: "--color-bg", name: "Page" },
    { token: "--color-surface", name: "Surface" },
    { token: "--color-sunken", name: "Sunken" },
    { token: "--color-border", name: "Hairline" },
    { token: "--color-border-strong", name: "Strong hairline" },
    { token: "--color-accent-weak", name: "Ink tint" },
];

const TEXT: readonly Swatch[] = [
    { token: "--color-text", name: "Text" },
    { token: "--color-text-secondary", name: "Secondary" },
    { token: "--color-text-muted", name: "Muted" },
];

function Swatches({ swatches }: { swatches: readonly Swatch[] }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
            {swatches.map((swatch) => (
                <div key={swatch.token} className="flex items-center gap-2.5">
                    <span
                        className="size-10 shrink-0 rounded-button border border-border"
                        style={{ background: `var(${swatch.token})` }}
                    />
                    <span className="min-w-0 leading-tight">
                        <span className="block text-sm font-medium">
                            {swatch.name}
                        </span>
                        {swatch.says !== undefined && (
                            <span className="block text-xs text-text-secondary">
                                {swatch.says}
                            </span>
                        )}
                        <code className="block truncate font-mono text-[11px] text-text-muted">
                            {swatch.token}
                        </code>
                    </span>
                </div>
            ))}
        </div>
    );
}

const TYPE_STEPS: readonly { name: string; className: string }[] = [
    {
        name: "Hero · 40",
        className: "text-hero font-semibold tracking-[-0.02em] tabular-nums",
    },
    { name: "XL · 28", className: "text-xl font-semibold" },
    { name: "LG · 20", className: "text-lg font-semibold tabular-nums" },
    { name: "MD · 16", className: "text-md font-semibold" },
    { name: "Base · 14", className: "text-base" },
    { name: "SM · 13", className: "text-sm text-text-secondary" },
    { name: "XS · 12", className: "text-xs text-text-muted" },
];

const RADII: readonly { name: string; token: string }[] = [
    { name: "Input · 6", token: "--radius-input" },
    { name: "Button · 8", token: "--radius-button" },
    { name: "Card · 12", token: "--radius-card" },
    { name: "Dialog · 16", token: "--radius-dialog" },
];

export function FoundationsSection() {
    return (
        <Stack>
            <Specimen
                title="Inks"
                rule="Four inks carry meaning and nothing else does. The ink marks where a hand can act and what a hand has set; the app gives it its hue. Green, red and amber are held in reserve for the states they name."
            >
                <Swatches swatches={INKS} />
            </Specimen>

            <Specimen
                title="Paper and tints"
                rule="Every neutral is the primary ink's hue at a whisper of chroma, so the page is one temperature. Tints are mixes of an ink into the surface, never a colour picked by eye."
            >
                <Group name="Surfaces and rules">
                    <Swatches swatches={PAPER} />
                </Group>
                <Group name="Text">
                    <Swatches swatches={TEXT} />
                </Group>
            </Specimen>

            <Specimen
                title="Depth"
                rule="Flat. On the page, depth comes from tone and hairlines: a surface on the page, a sunken band within it. A shadow means the thing floats above the page, so only dialogs, popovers and toasts cast one."
            >
                <div className="grid gap-4 rounded-card bg-bg p-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-text-muted">
                            On the page
                        </span>
                        <div className="rounded-card border border-border bg-surface p-3 text-sm">
                            A card: surface and a hairline.
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-text-muted">
                            Within a card
                        </span>
                        <div className="overflow-hidden rounded-card border border-border bg-surface text-sm">
                            <div className="p-3">Content</div>
                            <div className="border-t border-border bg-sunken p-3 text-text-secondary">
                                A sunken band
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-text-muted">Floats</span>
                        <div className="rounded-dialog bg-surface p-3 text-sm shadow-overlay">
                            An overlay: the one shadow.
                        </div>
                    </div>
                </div>
            </Specimen>

            <Specimen
                title="Type"
                rule="Three voices. The display face speaks for the product, the working face does everything else, and the mono face quotes what must be read exactly. Hierarchy comes from weight and colour before size."
            >
                <Group name="Display: the wordmark and a screen's title">
                    <span className={SCREEN_TITLE_CLASS}>Projects</span>
                </Group>
                <Group name="Working face">
                    <div className="flex flex-col gap-2">
                        {TYPE_STEPS.map((step) => (
                            <div
                                key={step.name}
                                className="flex items-baseline gap-4"
                            >
                                <span className="w-20 shrink-0 text-xs text-text-muted">
                                    {step.name}
                                </span>
                                <span className={step.className}>
                                    Atlas was updated 4 minutes ago
                                </span>
                            </div>
                        ))}
                    </div>
                </Group>
                <Group name="Mono: what is typed or copied verbatim">
                    <span className="font-mono text-xs text-text-secondary">
                        Authorization: Bearer &lt;token&gt;
                    </span>
                </Group>
            </Specimen>

            <Specimen
                title="Sizes and corners"
                rule="Controls used together take the same height. Corners grow with the thing they round: a field, a button, a card, a dialog."
            >
                <Group name="Control heights">
                    <Samples>
                        <Sample name="Control · 32">
                            <Button>Save</Button>
                        </Sample>
                        <Sample name="Compact · 28">
                            <ChipTrigger size="bar">Any project</ChipTrigger>
                        </Sample>
                        <Sample name="Inline · 24">
                            <ChipTrigger size="row">Atlas</ChipTrigger>
                        </Sample>
                    </Samples>
                </Group>
                <Group name="Corners">
                    <Samples>
                        {RADII.map((radius) => (
                            <Sample key={radius.token} name={radius.name}>
                                <span
                                    className="block size-14 border border-border-strong bg-sunken"
                                    style={{
                                        borderRadius: `var(${radius.token})`,
                                    }}
                                />
                            </Sample>
                        ))}
                    </Samples>
                </Group>
            </Specimen>
        </Stack>
    );
}
