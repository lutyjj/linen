import { Plus, Sparkles, Trash2 } from "lucide-react";
import { type ComponentProps, useState } from "react";

import {
    Actions,
    Button,
    buttonClass,
    Card,
    CardBody,
    CardHead,
    CellNumber,
    CellSelect,
    CellText,
    Checkbox,
    Chip,
    ChipTrigger,
    CopyValue,
    FieldRow,
    Form,
    IconButton,
    Kbd,
    LINK_CLASS,
    NumberField,
    OptionCards,
    SearchField,
    SearchSelect,
    SegmentedControl,
    Select,
    SelectToggle,
    SettingRow,
    ShownOnce,
    Switch,
    TextField,
} from "../src";
import { historyNavigation } from "./navigation";
import { Sample, Samples, Specimen, Stack } from "./Specimen";

const { Link } = historyNavigation;

/** What an answer refused, held as the app holds it. */
const REFUSED = {
    port: "A port is a whole number up to 65535.",
    owner: "A project needs an owner.",
};

const PROJECTS = ["Atlas", "Orion", "Vega", "Lyra"];

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

/** A number field that holds its own value, as a sample needs. */
function HeldNumber({
    start,
    ...props
}: Omit<ComponentProps<typeof NumberField>, "value" | "onValueChange"> & {
    start: number | null;
}) {
    const [value, setValue] = useState(start);
    return <NumberField {...props} value={value} onValueChange={setValue} />;
}

const RUNS = ["Hourly", "Daily", "Weekly"].map((run) => ({
    value: run,
    label: run,
}));

function NumberSpecimen() {
    const [runs, setRuns] = useState("Daily");
    const [copies, setCopies] = useState<number | null>(12);
    const [kept, setKept] = useState<number | null>(30);
    return (
        <Specimen
            title="A number in a range"
            rule="A number set within a range moves in steps: the arrows and its buttons take one, Shift takes ten of them unless the field says otherwise, and Home and End go to either end. Its value starts where every field's value starts, its unit a space after it, and its steps stand together at the frame's end, where a picker's chevron stands. At either end of the range only the step that cannot go further dims."
            framed={false}
        >
            <Card>
                <CardBody>
                    <Form
                        errors={{ limit: "A limit is at least 1 GB." }}
                        onSubmit={() => undefined}
                        className="grid max-w-2xl gap-4 sm:grid-cols-2"
                    >
                        <HeldNumber
                            label="Copies kept"
                            hint="From 1 to 30."
                            start={7}
                            min={1}
                            max={30}
                        />
                        <HeldNumber
                            label="Kept for"
                            unit="days"
                            start={30}
                            min={1}
                            max={365}
                        />
                        <HeldNumber
                            label="Retries"
                            hint="Set for the whole workspace."
                            start={3}
                            min={0}
                            max={10}
                            disabled
                        />
                        <HeldNumber
                            label="Workers"
                            hint="At its most."
                            start={16}
                            min={1}
                            max={16}
                        />
                        <HeldNumber
                            label="Delay"
                            unit="sec"
                            hint="At its least."
                            start={0}
                            min={0}
                            max={600}
                        />
                        <HeldNumber
                            label="Scale"
                            unit="×"
                            start={1.25}
                            min={0.25}
                            max={4}
                            step={0.05}
                            format={{ minimumFractionDigits: 2 }}
                        />
                        <HeldNumber
                            label="Time offset"
                            unit="h"
                            start={-5}
                            min={-12}
                            max={14}
                        />
                        <HeldNumber
                            label="Batch size"
                            unit="rows"
                            start={10000}
                            min={500}
                            max={50000}
                            step={500}
                        />
                        <HeldNumber
                            label="Storage limit"
                            name="limit"
                            unit="GB"
                            start={0}
                            min={0}
                            max={1000}
                        />
                    </Form>
                    <div className="flex flex-col gap-4">
                        <Select
                            label="Runs"
                            width={64}
                            choices={RUNS}
                            value={runs}
                            onValueChange={setRuns}
                        />
                        <TextField
                            label="Name"
                            width={64}
                            defaultValue="Nightly export"
                        />
                        <HeldNumber
                            label="Retries"
                            width={32}
                            start={3}
                            min={0}
                            max={10}
                            disabled
                        />
                        <HeldNumber
                            label="Delay"
                            hint="Shift steps a minute."
                            width={32}
                            unit="sec"
                            start={30}
                            min={0}
                            max={600}
                            largeStep={60}
                        />
                        <HeldNumber
                            label="Copies kept"
                            width={28}
                            start={12}
                            min={1}
                            max={30}
                        />
                        <HeldNumber
                            label="Batch size"
                            hint="Narrower than its value: the unit gives way first."
                            width={28}
                            unit="rows"
                            start={10000}
                            min={500}
                            max={50000}
                            step={500}
                        />
                    </div>
                    <FieldRow>
                        <HeldNumber
                            label="Width"
                            width={36}
                            unit="px"
                            start={1920}
                            min={16}
                            max={7680}
                        />
                        <HeldNumber
                            label="Height"
                            width={36}
                            unit="px"
                            start={1080}
                            min={16}
                            max={4320}
                        />
                        <Button>Resize</Button>
                    </FieldRow>
                </CardBody>
            </Card>
            <Card>
                <CardHead title="Exports" />
                <SettingRow
                    title="Copies kept"
                    description="The oldest is removed when another is made."
                >
                    <CellNumber
                        aria-label="Copies kept"
                        width={28}
                        value={copies}
                        onValueChange={setCopies}
                        min={1}
                        max={30}
                    />
                </SettingRow>
                <SettingRow
                    title="Kept for"
                    description="How long a copy stays before it is removed."
                >
                    <CellNumber
                        aria-label="Kept for"
                        width={36}
                        unit="days"
                        value={kept}
                        onValueChange={setKept}
                        min={1}
                        max={365}
                    />
                </SettingRow>
            </Card>
        </Specimen>
    );
}

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
    const [destination, setDestination] = useState<"email" | "folder">();
    const [filtered, setFiltered] = useState(true);
    const [saving, setSaving] = useState(false);
    const [port, setPort] = useState("80800");
    const [listens, setListens] = useState("8080");
    const [retention, setRetention] = useState("900");
    const [note, setNote] = useState("Ships on Friday");
    const [title, setTitle] = useState("Atlas");
    const [suggested, setSuggested] = useState<string>();
    const [query, setQuery] = useState("");
    const [filterQuery, setFilterQuery] = useState("");
    const [filterOwner, setFilterOwner] = useState("");
    const [picked, setPicked] = useState(["Orion"]);
    const [lastPicked, setLastPicked] = useState(0);
    // Shift takes every row between the last one pressed and this one.
    const pick = (at: number, checked: boolean, range: boolean) => {
        const rows = range
            ? PROJECTS.slice(
                  Math.min(lastPicked, at),
                  Math.max(lastPicked, at) + 1,
              )
            : PROJECTS.slice(at, at + 1);
        setPicked(
            checked
                ? PROJECTS.filter(
                      (one) => picked.includes(one) || rows.includes(one),
                  )
                : picked.filter((one) => !rows.includes(one)),
        );
        setLastPicked(at);
    };

    const save = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 2400);
    };

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
                        <Actions>
                            <Button disabled>Cancel</Button>
                            <Button variant="primary" disabled>
                                Save
                            </Button>
                            <Button variant="destructive" disabled>
                                Revoke
                            </Button>
                        </Actions>
                    </Sample>
                    <Sample name="Busy, pressed to see">
                        <Button variant="primary" busy={saving} onClick={save}>
                            Save changes
                        </Button>
                    </Sample>
                    <Sample name="Icon">
                        <IconButton aria-label="Remove">
                            <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                    </Sample>
                    <Sample name="A link to where it happens">
                        <Link href="/tasks" className={buttonClass()}>
                            Open tasks
                        </Link>
                    </Sample>
                    <Sample name="A link in running text">
                        <p className="text-sm text-text-secondary">
                            Reports run nightly;{" "}
                            <Link href="/feedback" className={LINK_CLASS}>
                                see the last run
                            </Link>
                            .
                        </p>
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="Fields"
                rule="A field wears the same frame wherever it stands, its name above it and its hint below, its value at the frame's inset and a unit a space after it. A refused value says why under the control, before the hint. A picker ends in one chevron, which turns as its list opens; a list of more than one kind of thing holds each under its heading."
            >
                <Form
                    errors={REFUSED}
                    onSubmit={() => undefined}
                    className="grid max-w-2xl gap-4 sm:grid-cols-2"
                >
                    <TextField
                        label="Name"
                        hint="Everyone in the workspace sees it."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <TextField
                        label="Port"
                        name="port"
                        width={20}
                        hint="Where the service listens."
                        inputMode="numeric"
                        value={port}
                        onChange={(event) => setPort(event.target.value)}
                    />
                    <TextField
                        label="Region"
                        hint="Set when the workspace was made."
                        value="Europe"
                        disabled
                        onChange={() => undefined}
                    />
                    <Select
                        label="Owner"
                        placeholder="Nobody"
                        choices={ASSIGNEES}
                        name="owner"
                        value=""
                        onValueChange={() => undefined}
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
                    <TextField
                        label="With a unit"
                        value={retention}
                        onChange={(event) => setRetention(event.target.value)}
                        unit="sec"
                    />
                </Form>
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
                            onValueChange={setDensity}
                        />
                    </Sample>
                    <Sample name="Disabled">
                        <div className="flex flex-wrap items-center gap-2">
                            <Checkbox
                                checked
                                disabled
                                onCheckedChange={() => undefined}
                            >
                                Archived
                            </Checkbox>
                            <Switch
                                aria-label="Archived"
                                checked
                                disabled
                                onCheckedChange={() => undefined}
                            />
                            <SegmentedControl
                                label="Density"
                                value="comfortable"
                                options={[
                                    {
                                        value: "comfortable",
                                        label: "Comfortable",
                                    },
                                    { value: "compact", label: "Compact" },
                                ]}
                                disabled
                                onValueChange={() => undefined}
                            />
                            <SelectToggle
                                label="Select Atlas"
                                checked={false}
                                disabled
                                onCheckedChange={() => undefined}
                            />
                        </div>
                    </Sample>
                    <Sample name="One option disabled">
                        <SegmentedControl
                            label="Export as"
                            value="pdf"
                            options={[
                                { value: "pdf", label: "PDF" },
                                { value: "html", label: "HTML" },
                                {
                                    value: "sheet",
                                    label: "Sheet",
                                    disabled: true,
                                },
                            ]}
                            onValueChange={() => undefined}
                        />
                    </Sample>
                    <Sample name="Search, as typing pauses">
                        <SearchField
                            label="Search projects"
                            placeholder="Search projects"
                            value={query}
                            onValueChange={setQuery}
                        />
                    </Sample>
                    <Sample name="Corrected in place">
                        <CellText
                            label="Listens on"
                            value={listens}
                            unit="port"
                            onCommit={(next) => {
                                setListens(next);
                                return Promise.resolve(true);
                            }}
                        />
                    </Sample>
                    <Sample name="Emptied, an answer">
                        <CellText
                            label="Note"
                            value={note}
                            placeholder="No note"
                            clearable
                            onCommit={(next) => {
                                setNote(next);
                                return Promise.resolve(true);
                            }}
                        />
                    </Sample>
                    <Sample name="A suggestion, opened to change">
                        <span className="flex items-center gap-2">
                            <CellText
                                label="Project name"
                                value={title}
                                draft={suggested}
                                onDiscard={() => setSuggested(undefined)}
                                onCommit={(next) => {
                                    setTitle(next);
                                    setSuggested(undefined);
                                    return Promise.resolve(true);
                                }}
                            />
                            <Button onClick={() => setSuggested("Atlas north")}>
                                Suggest
                            </Button>
                        </span>
                    </Sample>
                    <Sample name="Selecting rows, a range with Shift">
                        <div className="flex flex-col gap-2 text-sm">
                            <span className="flex items-center gap-2 text-text-secondary">
                                <SelectToggle
                                    label="Select every project"
                                    checked={picked.length === PROJECTS.length}
                                    indeterminate={
                                        picked.length > 0 &&
                                        picked.length < PROJECTS.length
                                    }
                                    onCheckedChange={(checked) =>
                                        setPicked(checked ? PROJECTS : [])
                                    }
                                />
                                {picked.length} chosen
                            </span>
                            {PROJECTS.map((project, at) => (
                                <span
                                    key={project}
                                    className="flex items-center gap-2"
                                >
                                    <SelectToggle
                                        label={`Select ${project}`}
                                        checked={picked.includes(project)}
                                        onCheckedChange={(checked, range) =>
                                            pick(at, checked, range)
                                        }
                                    />
                                    {project}
                                </span>
                            ))}
                        </div>
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="Fields in a row"
                rule="A narrow field widens to hold its name and messages, up to 20rem, so a refusal reads in a line. A field that states 20rem or more keeps its width, and its hint wraps under its control: wide fields stand two by two, and an action stays beside the field it belongs to."
            >
                <div className="grid max-w-2xl gap-4">
                    <FieldRow>
                        <TextField
                            label="Title"
                            width={80}
                            defaultValue="Quarterly report"
                        />
                        <TextField
                            label="Recipients"
                            width={80}
                            defaultValue="team@example.com"
                        />
                        <TextField
                            label="Subject"
                            width={80}
                            hint="Shown at the top of every mail it sends, and as the name of the file it attaches."
                            defaultValue="Your report for the quarter"
                        />
                        <TextField
                            label="Reply to"
                            width={80}
                            defaultValue="reports@example.com"
                        />
                    </FieldRow>
                    <FieldRow>
                        <TextField
                            label="Project name"
                            width={96}
                            hint="Everyone in the workspace sees it, in the rail, on every report and in each mail."
                            defaultValue="Atlas"
                        />
                        <Button>Save</Button>
                    </FieldRow>
                </div>
            </Specimen>

            <Specimen
                title="Fields on a phone"
                rule="A field's stated width is its control's, up to the width it is given; its name and its messages take the room the field stands in. On a phone a row of fields stands them one under another, each filling the column. A picker's list is never wider than the screen; a long choice wraps. Narrow the window to a phone's width: every chevron stays inside the card."
            >
                <div className="grid max-w-2xl gap-4">
                    <Form errors={REFUSED} onSubmit={() => undefined}>
                        <FieldRow>
                            <TextField
                                label="Host"
                                width={48}
                                value="db.example.com"
                                onChange={() => undefined}
                            />
                            <TextField
                                label="Port"
                                name="port"
                                width={20}
                                inputMode="numeric"
                                value={port}
                                onChange={(event) =>
                                    setPort(event.target.value)
                                }
                            />
                            <Button>Connect</Button>
                        </FieldRow>
                    </Form>
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

            <NumberSpecimen />

            <Specimen
                title="Options with a meaning each"
                rule="A choice whose answers each need a line is a set of cards. The chosen card stays marked; a suggested one wears the ink's tint and a mark until the question is answered."
            >
                <div className="flex max-w-2xl flex-col gap-4">
                    <OptionCards
                        label="How to remove it"
                        value={removal}
                        options={[
                            {
                                value: "archive",
                                label: "Archive",
                                description: "It can be restored later.",
                            },
                            {
                                value: "delete",
                                label: "Delete",
                                description:
                                    "Its tasks and files are gone for good.",
                            },
                        ]}
                        onValueChange={setRemoval}
                    />
                    <OptionCards
                        label="Where the report goes"
                        value={destination}
                        suggested="email"
                        suggestedMark={
                            <Sparkles aria-hidden="true" className="size-3.5" />
                        }
                        options={[
                            {
                                value: "email",
                                label: "Email it",
                                description:
                                    "Each Monday, to everyone in the project.",
                            },
                            {
                                value: "folder",
                                label: "Keep it in the project",
                                description: "In Reports, for anyone to open.",
                            },
                        ]}
                        onValueChange={setDestination}
                    />
                    <OptionCards
                        label="How to share it, one answer closed"
                        value="link"
                        options={[
                            {
                                value: "link",
                                label: "A link",
                                description: "Anyone with it can read.",
                            },
                            {
                                value: "invite",
                                label: "An invitation",
                                description: "Only for people in the project.",
                                disabled: true,
                            },
                        ]}
                        onValueChange={() => undefined}
                    />
                    <OptionCards
                        label="How to share it, all closed"
                        value="link"
                        disabled
                        options={[
                            {
                                value: "link",
                                label: "A link",
                                description: "Anyone with it can read.",
                            },
                            {
                                value: "invite",
                                label: "An invitation",
                                description: "Only for people in the project.",
                            },
                        ]}
                        onValueChange={() => undefined}
                    />
                </div>
            </Specimen>

            <Specimen
                title="Chips and values"
                rule="A chip names a scope or a value beside a name, in a tone where it means one. A value to copy whole is shown in full, with its copy control beside it."
            >
                <Samples>
                    <Sample name="Neutral">
                        <Chip size="row">Full access</Chip>
                    </Sample>
                    <Sample name="Caution">
                        <Chip size="row" tone="warn">
                            Not seen lately
                        </Chip>
                    </Sample>
                    <Sample name="Positive">
                        <Chip size="row" tone="positive">
                            Verified
                        </Chip>
                    </Sample>
                    <Sample name="Danger">
                        <Chip size="row" tone="danger">
                            Suspended
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
                    <Sample name="Removable, a filter">
                        {filtered ? (
                            <Chip
                                onRemove={() => setFiltered(false)}
                                removeLabel="Remove the Atlas filter"
                            >
                                Project: Atlas
                            </Chip>
                        ) : (
                            <ChipTrigger onClick={() => setFiltered(true)}>
                                Any project
                            </ChipTrigger>
                        )}
                    </Sample>
                    <Sample name="Framed under the hand">
                        <ChipTrigger size="row" frame="hover">
                            Atlas
                        </ChipTrigger>
                    </Sample>
                    <Sample name="Muted, framed at rest">
                        <Chip size="row" tone="muted" frame="rest">
                            Archived
                        </Chip>
                    </Sample>
                    <Sample name="Trigger, disabled">
                        <ChipTrigger disabled>Any owner</ChipTrigger>
                    </Sample>
                    <Sample name="A bar of filters, compact">
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchField
                                label="Search tasks"
                                placeholder="Search tasks"
                                value={filterQuery}
                                onValueChange={setFilterQuery}
                                className="min-h-(--height-control-compact) w-40"
                            />
                            <CellSelect
                                aria-label="Owner"
                                placeholder="Any owner"
                                choices={[
                                    { value: "ada", label: "Ada" },
                                    { value: "grace", label: "Grace" },
                                ]}
                                value={filterOwner}
                                onValueChange={setFilterOwner}
                                className="min-h-(--height-control-compact)"
                            />
                            <Chip
                                onRemove={() => undefined}
                                removeLabel="Remove the Atlas filter"
                            >
                                Project: Atlas
                            </Chip>
                        </div>
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

            <Specimen
                title="Shown once"
                rule="A secret the server keeps only a hash of is on screen once. It says so in a description's words, sits in the well a value to copy whole wears, and offers a button that says what it copies."
                framed={false}
            >
                <Card>
                    <CardHead
                        title="Access tokens"
                        description="A script reads reports with a token of its own."
                    />
                    <CardBody>
                        <ShownOnce
                            title="New token"
                            description="Give it to the script that will use it."
                            label="Access token"
                            secret="tok_example_000000000000000000000000"
                            copyLabel="Copy token"
                            lost="If it is lost, revoke it and make another."
                        />
                    </CardBody>
                </Card>
                <Card>
                    <CardHead
                        title="Invitations"
                        description="A person joins the project with a code that works once."
                    />
                    <CardBody>
                        <ShownOnce
                            title="Invitation code"
                            description="Send the invitation to the person joining."
                            label="Invitation code"
                            secret="K7Q2-9XPL"
                            copies="Join Atlas at https://example.com/join with the code K7Q2-9XPL."
                            copyLabel="Copy invitation"
                        />
                    </CardBody>
                </Card>
            </Specimen>
        </Stack>
    );
}
