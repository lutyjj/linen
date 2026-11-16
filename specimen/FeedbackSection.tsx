import { useState } from "react";

import {
    Button,
    Checkbox,
    Conditions,
    ConfirmDialog,
    Elapsed,
    ExplainedStatus,
    FormDialog,
    type FormErrors,
    Gauge,
    Gauges,
    Notice,
    NumberField,
    OptionCards,
    PromptDialog,
    ShownOnce,
    Status,
    TextField,
    useToast,
} from "../src";
import { wandering } from "./live";
import { Group, Sample, Samples, Specimen, Stack } from "./Specimen";

const [READ, WRITE] = wandering([60, 30], 0, 200);
const PARTS = [
    "Tasks",
    "Comments",
    "Files",
    "Members",
    "Time entries",
    "Labels",
    "Archived tasks",
    "The audit log",
];
const STARTED = Date.now() - 83_000;
const mbps = (value: number) => `${Math.round(value)} MB/s`;
/** A write that takes a moment. */
const pause = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

export function FeedbackSection() {
    const toast = useToast();
    const [confirming, setConfirming] = useState(false);
    const [asking, setAsking] = useState(false);
    const [making, setMaking] = useState(false);
    const [name, setName] = useState("");
    const [removing, setRemoving] = useState(false);
    const [refused, setRefused] = useState<FormErrors>();
    const [removal, setRemoval] = useState<"archive" | "delete">("archive");
    const [scheduling, setScheduling] = useState(false);
    const [every, setEvery] = useState<number | null>(24);
    const [parts, setParts] = useState<string[]>(PARTS.slice(0, 3));

    return (
        <Stack>
            <Specimen
                title="A state in a word"
                rule="A status says what state something is in, after a dot that carries its tone. Words that want attention, a warning or a failure, wear the tone's ink too; something happening now wears a ring that beats. A state the person cannot change says why, under a resting pointer, a press or a key."
            >
                <Samples>
                    <Sample name="Positive, live">
                        <Status tone="positive" active>
                            Running
                        </Status>
                    </Sample>
                    <Sample name="Accent">
                        <Status tone="accent">Scheduled</Status>
                    </Sample>
                    <Sample name="Warn">
                        <Status tone="warn">Behind by 3 runs</Status>
                    </Sample>
                    <Sample name="Danger">
                        <Status tone="danger">Stopped</Status>
                    </Sample>
                    <Sample name="Neutral">
                        <Status>Paused</Status>
                    </Sample>
                    <Sample name="Unknown">
                        <Status tone="unknown">Not heard from yet</Status>
                    </Sample>
                    <Sample name="Explained">
                        <ExplainedStatus description="Viewers see a project's settings but cannot change them. An owner can make you an editor.">
                            Read only
                        </ExplainedStatus>
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="A message beside its cause"
                rule="A message stands beside the act or the fields it is about, on its tone's tint: one sentence, what it means under it, and the one thing to do about it. A failure is read out at once."
            >
                <div className="flex max-w-2xl flex-col gap-3">
                    <Notice
                        tone="danger"
                        title="The export did not finish."
                        description="The archive was larger than the space left."
                        action={<Button>Try again</Button>}
                    />
                    <Notice tone="warn" title="This token expires in 3 days." />
                    <Notice
                        title="Changes here apply to every project."
                        description="A project's own settings still win."
                    />
                    <Notice tone="positive" title="The webhook answered." />
                </div>
            </Specimen>

            <Specimen
                title="Conditions of the whole app"
                rule="A condition that concerns the whole app stands at the top of every screen until it ends, stuck there while the screen scrolls, with the screen's bars beneath it. Two or more stand a failure first. The menu at the rail's foot raises them on this page."
                framed={false}
            >
                <div className="overflow-hidden rounded-card border border-border">
                    <Conditions
                        className="static"
                        conditions={[
                            {
                                id: "service",
                                tone: "danger",
                                title: "The service does not answer.",
                                description: "Changes wait until it does.",
                                action: <Button>Try again</Button>,
                            },
                            {
                                id: "export",
                                active: true,
                                title: "Exporting the archive",
                                description: <Elapsed since={STARTED} />,
                            },
                            {
                                id: "storage",
                                tone: "warn",
                                title: "Read only while storage is nearly full.",
                            },
                        ]}
                    />
                </div>
            </Specimen>

            <Specimen
                title="Gauges"
                rule="A gauge shows a value on a bounded scale: an empty track with its zones in a line under it, and a fill in the colour of each zone it reaches, with a mark where the value was held or a threshold is set. At its lowest it is empty. Gauges read together stand close, lined up. A live gauge follows its value without rendering anything around it."
            >
                <div className="flex max-w-md flex-col gap-5">
                    <Gauge
                        label="Storage"
                        value={0.82}
                        format={(value) => `${Math.round(value * 100)}%`}
                        zones={[
                            { from: 0, to: 0.7, tone: "positive" },
                            { from: 0.7, to: 0.9, tone: "warn" },
                            { from: 0.9, to: 1, tone: "danger" },
                        ]}
                        marks={[{ value: 0.9, kind: "set", label: "Limit" }]}
                    />
                    <Gauge
                        label="Backlog"
                        value={0}
                        max={40}
                        format={(value) => `${value} tasks`}
                        zones={[
                            { from: 0, to: 30, tone: "accent" },
                            { from: 30, to: 40, tone: "warn" },
                        ]}
                    />
                    <Gauges label="Disk activity">
                        <Gauge
                            label="Read"
                            value={READ?.level ?? 0}
                            max={200}
                            format={mbps}
                            marks={[
                                {
                                    value: READ?.high ?? 0,
                                    kind: "held",
                                    label: "Highest",
                                },
                            ]}
                        />
                        <Gauge
                            label="Write"
                            value={WRITE?.level ?? 0}
                            max={200}
                            format={mbps}
                            marks={[
                                {
                                    value: WRITE?.high ?? 0,
                                    kind: "held",
                                    label: "Highest",
                                },
                            ]}
                        />
                    </Gauges>
                </div>
            </Specimen>

            <Specimen
                title="Dialogs"
                rule="A dialog is modal and alone: it rises in the middle of the page with its scrim and says what the act does before it is done. Destructive acts confirm; acts that can be put back exactly take a toast's undo instead."
            >
                <Samples>
                    <Sample name="Confirm">
                        <Button
                            variant="destructive"
                            onClick={() => setConfirming(true)}
                        >
                            Revoke
                        </Button>
                    </Sample>
                    <Sample name="With a question">
                        <Button
                            variant="destructive"
                            onClick={() => setRemoving(true)}
                        >
                            Remove
                        </Button>
                    </Sample>
                    <Sample name="Form">
                        <Button
                            variant="primary"
                            onClick={() => {
                                setName("");
                                setMaking(true);
                            }}
                        >
                            New token
                        </Button>
                    </Sample>
                    <Sample name="Prompt">
                        <Button onClick={() => setAsking(true)}>Rename</Button>
                    </Sample>
                    <Sample name="Taller than the window">
                        <Button onClick={() => setScheduling(true)}>
                            Schedule an export
                        </Button>
                    </Sample>
                </Samples>
                <ConfirmDialog
                    open={confirming}
                    onOpenChange={setConfirming}
                    title="Revoke the nightly export's token?"
                    description="Whatever uses it stops working at once."
                    confirmLabel="Revoke"
                    destructive
                    onConfirm={async () => {
                        await pause(1500);
                        setConfirming(false);
                        toast.show({ text: "Token revoked" });
                    }}
                />
                <ConfirmDialog
                    open={removing}
                    onOpenChange={setRemoving}
                    title="Remove Atlas?"
                    description="Its members keep their accounts either way."
                    confirmLabel={removal === "delete" ? "Delete" : "Archive"}
                    destructive
                    onConfirm={() => {
                        setRemoving(false);
                        toast.show({ text: "Atlas removed" });
                    }}
                >
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
                </ConfirmDialog>
                <FormDialog
                    open={making}
                    onOpenChange={(open) => {
                        setMaking(open);
                        setRefused(undefined);
                    }}
                    title="New access token"
                    description="It acts as you until you revoke it."
                    confirmLabel="Create token"
                    disabled={name.trim() === ""}
                    errors={refused}
                    onConfirm={async () => {
                        // A check that refuses a name in use.
                        await pause(1200);
                        if (name.trim() === "Nightly export") {
                            setRefused({
                                name: "A token already has this name.",
                            });
                            return;
                        }
                        setRefused(undefined);
                        setMaking(false);
                        toast.show({ text: `${name} created` });
                    }}
                >
                    <TextField
                        label="Name"
                        name="name"
                        hint="What will hold it, so you know which to revoke. Nightly export is taken."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </FormDialog>
                <PromptDialog
                    open={asking}
                    onOpenChange={setAsking}
                    title="Rename the project"
                    label="Name"
                    placeholder="Atlas"
                    confirmLabel="Rename"
                    onConfirm={(name) => {
                        setAsking(false);
                        toast.show({ text: `Renamed ${name}` });
                    }}
                />
                <FormDialog
                    open={scheduling}
                    onOpenChange={setScheduling}
                    title="Schedule an export"
                    description="Atlas is copied out on its schedule and sent where you say."
                    confirmLabel="Schedule"
                    onConfirm={() => {
                        setScheduling(false);
                        toast.show({ text: "Export scheduled" });
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <TextField label="Name" defaultValue="Nightly export" />
                        <TextField
                            label="Send it to"
                            hint="An address that takes files, such as exports@example.com."
                            defaultValue="exports@example.com"
                        />
                        <NumberField
                            label="Every"
                            value={every}
                            onValueChange={setEvery}
                            min={1}
                            max={168}
                            unit="hours"
                            width={160}
                        />
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">What it holds</p>
                            {PARTS.map((part) => (
                                <Checkbox
                                    key={part}
                                    checked={parts.includes(part)}
                                    onCheckedChange={(checked) =>
                                        setParts(
                                            checked
                                                ? [...parts, part]
                                                : parts.filter(
                                                      (one) => one !== part,
                                                  ),
                                        )
                                    }
                                >
                                    {part}
                                </Checkbox>
                            ))}
                        </div>
                        <TextField
                            label="A note for whoever reads it"
                            hint="Sent with each export."
                        />
                    </div>
                </FormDialog>
            </Specimen>

            <Specimen
                title="Toasts"
                rule="Every write lands somewhere visible. A toast arrives, stands while its undo is on offer, and leaves; a failure that needs an answer stays until it is dismissed."
            >
                <Samples>
                    <Sample name="With undo">
                        <Button
                            onClick={() =>
                                toast.show({
                                    text: "Task removed from the list",
                                    onUndo: () => undefined,
                                })
                            }
                        >
                            Remove an entry
                        </Button>
                    </Sample>
                    <Sample name="Sticky failure">
                        <Button
                            onClick={() =>
                                toast.show({
                                    text: "The server refused the password.",
                                    sticky: true,
                                    action: {
                                        label: "Try again",
                                        run: () => undefined,
                                    },
                                })
                            }
                        >
                            Fail
                        </Button>
                    </Sample>
                    <Sample name="Progress">
                        <Button
                            onClick={() =>
                                toast.show({
                                    text: "Uploading files",
                                    sticky: true,
                                    progress: 0.6,
                                })
                            }
                        >
                            Upload
                        </Button>
                    </Sample>
                </Samples>
            </Specimen>

            <Specimen
                title="Shown once"
                rule="A secret the server keeps only a hash of is on screen once. It says so, and offers the one control that takes it."
            >
                <Group name="A new token">
                    <ShownOnce
                        what="Token"
                        label="Access token"
                        secret="tok_example_000000000000000000000000"
                        copyLabel="Copy token"
                        lost="If it is lost, revoke it and make another."
                    >
                        Give it to the script that will use it.
                    </ShownOnce>
                </Group>
            </Specimen>
        </Stack>
    );
}
