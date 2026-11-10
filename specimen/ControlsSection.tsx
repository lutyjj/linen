import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
    Button,
    CellInput,
    Checkbox,
    Chip,
    ChipTrigger,
    CopyValue,
    FieldRow,
    IconButton,
    Kbd,
    OptionCards,
    SearchSelect,
    SegmentedControl,
    Select,
    Switch,
    TextField,
    WarnDot,
} from "../src";
import { Sample, Samples, Specimen, Stack } from "./Specimen";

const ZONES = [
    "Europe/London",
    "Europe/Lisbon",
    "America/New_York",
    "Asia/Tokyo",
].map((zone) => ({ value: zone, label: zone }));

/** Choices longer than a phone is wide. */
const TEMPLATES = [
    "Quarterly report (A4 landscape, two columns, cover page) · PDF",
    "Monthly summary (A4 portrait, one column, no cover page) · PDF",
    "Weekly digest (US letter, compact) · HTML",
].map((template) => ({ value: template, label: template }));

/** Things of two kinds in one list, under their headings. */
const ASSIGNEES = [
    {
        label: "Teams",
        choices: [
            { value: "team:design", label: "Design" },
            { value: "team:platform", label: "Platform" },
        ],
    },
    {
        label: "People",
        choices: [
            { value: "person:ada", label: "Ada" },
            { value: "person:grace", label: "Grace" },
        ],
    },
];

export function ControlsSection() {
    const [name, setName] = useState("Atlas");
    const [zone, setZone] = useState("");
    const [searched, setSearched] = useState("");
    const [template, setTemplate] = useState(TEMPLATES[0]?.value ?? "");
    const [assignee, setAssignee] = useState("");
    const [checked, setChecked] = useState(true);
    const [on, setOn] = useState(false);
    const [density, setDensity] = useState<"comfortable" | "compact">(
        "comfortable",
    );
    const [removal, setRemoval] = useState<"archive" | "delete">("archive");

    return (
        <Stack>
            <Specimen
                title="Buttons"
                rule="A button wears a frame and a fill, never words alone. Primary is the ink, one per card or form; destructive sets its words in red inside the same frame and opens a confirmation rather than acting."
            >
                <Samples>
                    <Sample name="Default">
                        <Button>Cancel</Button>
                    </Sample>
                    <Sample name="Primary">
                        <Button variant="primary">
                            <Plus aria-hidden="true" className="size-4" />
                            New project
                        </Button>
                    </Sample>
                    <Sample name="Destructive">
                        <Button variant="destructive">Revoke</Button>
                    </Sample>
                    <Sample name="Disabled">
                        <Button variant="primary" disabled>
                            Save
                        </Button>
                    </Sample>
                    <Sample name="Icon">
                        <IconButton aria-label="Remove">
                            <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="Fields"
                rule="A field wears the same frame wherever it stands, its name above it and its hint below. A picker ends in one chevron, which turns as its list opens; a list of more than one kind of thing holds each under its heading."
            >
                <div className="grid max-w-2xl gap-x-4 sm:grid-cols-2">
                    <TextField
                        label="Name"
                        hint="Everyone in the workspace sees it."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Select
                        label="Time zone"
                        placeholder="The server's"
                        choices={ZONES}
                        value={zone}
                        onValueChange={setZone}
                    />
                    <SearchSelect
                        label="Searchable"
                        placeholder="Choose a zone"
                        searchLabel="Search zones"
                        choices={ZONES}
                        value={searched}
                        onValueChange={setSearched}
                    />
                    <Select
                        label="Of more than one kind"
                        hint="Each kind under its heading."
                        placeholder="Nobody"
                        choices={ASSIGNEES}
                        value={assignee}
                        onValueChange={setAssignee}
                    />
                    <div className="mb-4">
                        <span className="mb-1 block text-sm font-medium">
                            With a unit
                        </span>
                        <CellInput
                            className="w-full"
                            defaultValue="900"
                            unit="sec"
                        />
                    </div>
                </div>
                <Samples>
                    <Sample name="Checkbox, for a form">
                        <Checkbox
                            checked={checked}
                            onCheckedChange={setChecked}
                        >
                            Read only
                        </Checkbox>
                    </Sample>
                    <Sample name="Switch, at once">
                        <Switch
                            aria-label="Publish"
                            checked={on}
                            onCheckedChange={setOn}
                        />
                    </Sample>
                    <Sample name="Segmented">
                        <SegmentedControl
                            label="Density"
                            value={density}
                            options={[
                                { value: "comfortable", label: "Comfortable" },
                                { value: "compact", label: "Compact" },
                            ]}
                            onChange={setDensity}
                        />
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="Fields on a phone"
                rule="A field's stated width is what it asks for, up to the width it is given, and a row of fields gives way to its column. A picker's list is never wider than the screen; a long choice wraps. Narrow the window to a phone's width: every chevron stays inside the card."
            >
                <div className="grid max-w-2xl gap-2">
                    <FieldRow>
                        <Select
                            label="In a row, beside its action"
                            width={104}
                            choices={TEMPLATES}
                            value={template}
                            onValueChange={setTemplate}
                        />
                        <Button variant="primary">Use this template</Button>
                    </FieldRow>
                    <Select
                        label="Alone in a grid"
                        width={104}
                        choices={TEMPLATES}
                        value={template}
                        onValueChange={setTemplate}
                    />
                </div>
            </Specimen>

            <Specimen
                title="Options with a meaning each"
                rule="A choice whose answers each need a line is a set of cards. The chosen card stays marked."
            >
                <div className="max-w-2xl">
                    <OptionCards
                        label="How to remove it"
                        value={removal}
                        options={[
                            {
                                value: "archive",
                                label: "Archive",
                                detail: "It can be restored later.",
                            },
                            {
                                value: "delete",
                                label: "Delete",
                                detail: "Its tasks and files are gone for good.",
                            },
                        ]}
                        onChoose={setRemoval}
                    />
                </div>
            </Specimen>

            <Specimen
                title="Chips and values"
                rule="A chip names a state or a scope beside a name. A value to copy whole is shown in full, with its copy control beside it."
            >
                <Samples>
                    <Sample name="Neutral">
                        <Chip size="row">Full access</Chip>
                    </Sample>
                    <Sample name="Caution">
                        <Chip size="row" tone="warn">
                            <WarnDot />
                            Not seen lately
                        </Chip>
                    </Sample>
                    <Sample name="Accent">
                        <Chip size="row" tone="accent">
                            Administrator
                        </Chip>
                    </Sample>
                    <Sample name="Trigger">
                        <ChipTrigger>Any project</ChipTrigger>
                    </Sample>
                    <Sample name="Key">
                        <Kbd>Esc</Kbd>
                    </Sample>
                </Samples>
                <div className="max-w-xl">
                    <CopyValue
                        label="Address"
                        value="https://api.example.com/v1"
                    />
                </div>
            </Specimen>
        </Stack>
    );
}
