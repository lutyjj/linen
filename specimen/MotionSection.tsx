import { RefreshCw } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
    arrive,
    BAND_CLASS,
    Button,
    Card,
    CardHead,
    classes,
    Count,
    Fact,
    Facts,
    RefreshMotion,
    SegmentedControl,
    SettlingItem,
    SettlingRows,
    SettlingTr,
    Swap,
    useToast,
} from "../src";
import { Group, Sample, Samples, Specimen, Stack } from "./Specimen";

const NAMES = ["Atlas", "Harbor", "Orchard", "Lantern", "Meadow", "Summit"];

const OWNERS: Readonly<Record<string, string>> = {
    "Draft the brief": "Ada",
    "Review the plan": "Grace",
    "Book the venue": "Alan",
    "Send the invitations": "Edsger",
    "Print the badges": "Barbara",
    "Pack the kit": "Donald",
};
const TASKS = Object.keys(OWNERS);

const EXPORTS = Array.from(
    { length: 40 },
    (_, at) => `export-${String(at + 1).padStart(4, "0")}.csv`,
);

/**
 * What a person adds to and removes from, as an app's list is. A removal can
 * be put back exactly, so it offers a toast's undo rather than a
 * confirmation, and the undo brings the entry back to its place.
 */
function useEntries(all: readonly string[], shown = all.length) {
    const toast = useToast();
    const [entries, setEntries] = useState(all.slice(0, shown));
    return {
        entries,
        full: entries.length === all.length,
        add: () => {
            const next = all.find((entry) => !entries.includes(entry));
            if (next !== undefined) setEntries([...entries, next]);
        },
        remove: (entry: string) => {
            const at = entries.indexOf(entry);
            setEntries(entries.filter((other) => other !== entry));
            toast.show({
                text: `${entry} removed`,
                onUndo: () => setEntries((now) => now.toSpliced(at, 0, entry)),
            });
        },
    };
}

function Projects({ onAdd }: { onAdd: () => void }) {
    const projects = useEntries(NAMES, 3);
    return (
        <Card className="max-w-md">
            <CardHead title="Projects">
                <Button
                    disabled={projects.full}
                    onClick={() => {
                        projects.add();
                        onAdd();
                    }}
                >
                    Add
                </Button>
            </CardHead>
            <SettlingRows scope="projects" marksArrivals>
                {projects.entries.map((name) => (
                    <SettlingItem
                        key={name}
                        className={classes(
                            BAND_CLASS,
                            "flex items-center justify-between text-sm",
                        )}
                    >
                        {name}
                        <Button onClick={() => projects.remove(name)}>
                            Remove
                        </Button>
                    </SettlingItem>
                ))}
            </SettlingRows>
        </Card>
    );
}

function Tasks() {
    const tasks = useEntries(TASKS, 3);
    return (
        <Card className="max-w-xl">
            <CardHead
                title="Tasks"
                aside={<Count>{tasks.entries.length}</Count>}
            >
                <Button disabled={tasks.full} onClick={tasks.add}>
                    Add
                </Button>
            </CardHead>
            <table className="w-full border-separate border-spacing-0 text-sm">
                <thead className="text-left text-xs text-text-muted">
                    <tr className="[&>th]:h-9 [&>th]:border-b [&>th]:border-border [&>th]:px-gutter [&>th]:font-medium">
                        <th>Task</th>
                        <th className="w-full">Owner</th>
                        <th>
                            <span className="sr-only">Remove</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <SettlingRows scope="tasks" marksArrivals>
                        {tasks.entries.map((task) => (
                            <SettlingTr
                                key={task}
                                className="[&>td]:border-b [&>td]:border-border [&>td]:p-gutter last:[&>td]:border-b-0"
                            >
                                <td className="whitespace-nowrap">{task}</td>
                                <td className="text-text-secondary">
                                    {OWNERS[task]}
                                </td>
                                <td>
                                    <Button
                                        aria-label={`Remove ${task}`}
                                        onClick={() => tasks.remove(task)}
                                    >
                                        Remove
                                    </Button>
                                </td>
                            </SettlingTr>
                        ))}
                    </SettlingRows>
                </tbody>
            </table>
        </Card>
    );
}

/** A long list that draws only the rows in view, each stood where it belongs. */
function Exports() {
    const files = useEntries(EXPORTS);
    const box = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState({ from: 0, to: 8 });
    // The room a row takes is what the list's height says it takes.
    const look = (scroller: HTMLElement) => {
        const row = scroller.scrollHeight / files.entries.length;
        const from = Math.max(0, Math.floor(scroller.scrollTop / row) - 1);
        const to = Math.min(
            files.entries.length,
            Math.ceil((scroller.scrollTop + scroller.clientHeight) / row) + 1,
        );
        setShown((now) =>
            now.from === from && now.to === to ? now : { from, to },
        );
    };
    useLayoutEffect(() => {
        if (box.current !== null && files.entries.length > 0) {
            look(box.current);
        }
    });
    return (
        <Card className="max-w-md">
            <CardHead
                title="Exports"
                aside={<Count>{files.entries.length}</Count>}
                description="Only the rows in view are drawn."
            />
            <m.div
                ref={box}
                layoutScroll
                data-scroll-box
                onScroll={(event) => look(event.currentTarget)}
                className="max-h-72 overflow-y-auto [--row:calc(var(--height-control)+2*var(--spacing-gutter))]"
            >
                <div
                    className="relative"
                    style={{
                        height: `calc(var(--row) * ${files.entries.length})`,
                    }}
                >
                    <SettlingRows
                        scope="exports"
                        revision={files.entries.join()}
                    >
                        {files.entries
                            .slice(shown.from, shown.to)
                            .map((file, at) => (
                                <SettlingItem
                                    key={file}
                                    style={{
                                        top: `calc(var(--row) * ${shown.from + at})`,
                                    }}
                                    className={classes(
                                        "absolute inset-x-0 flex h-(--row) items-center justify-between gap-2 px-gutter text-sm",
                                        shown.from + at > 0 &&
                                            "border-t border-border",
                                    )}
                                >
                                    <span className="font-mono text-xs text-text-secondary">
                                        {file}
                                    </span>
                                    <Button
                                        aria-label={`Remove ${file}`}
                                        onClick={() => files.remove(file)}
                                    >
                                        Remove
                                    </Button>
                                </SettlingItem>
                            ))}
                    </SettlingRows>
                </div>
            </m.div>
        </Card>
    );
}

/** A refresh that runs for a few seconds, as one that waits on an answer does. */
function Refresh() {
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        if (!refreshing) return;
        const done = setTimeout(() => setRefreshing(false), 2500);
        return () => clearTimeout(done);
    }, [refreshing]);
    return (
        <Button busy={refreshing} onClick={() => setRefreshing(true)}>
            <RefreshMotion active={refreshing}>
                <RefreshCw aria-hidden="true" className="size-4" />
            </RefreshMotion>
            Refresh
        </Button>
    );
}

export function MotionSection() {
    const [view, setView] = useState<"image" | "facts">("image");
    const [arrivals, setArrivals] = useState(0);

    return (
        <Stack>
            <Specimen
                title="Motion shows what changed"
                rule="A change applies at once and the animation follows it. Only opacity and transforms move, except a height that is itself the change; everything leaving is inert from its first frame; reduced motion stops it all."
            >
                <Group name="A chosen mark slides">
                    <SegmentedControl
                        label="View"
                        value={view}
                        options={[
                            { value: "image", label: "Image" },
                            { value: "facts", label: "Facts" },
                        ]}
                        onValueChange={setView}
                    />
                </Group>
                <Group name="A view swaps">
                    <Swap view={view} className="max-w-md">
                        {view === "image" ? (
                            <div className="grid h-40 place-items-center rounded-card bg-sunken text-sm text-text-muted">
                                The project's cover
                            </div>
                        ) : (
                            <div className="rounded-card border border-border p-gutter">
                                <Facts>
                                    <Fact name="Owner">Ada</Fact>
                                    <Fact name="Status">On track</Fact>
                                    <Fact name="Open tasks">24</Fact>
                                    <Fact name="Last update">
                                        4 minutes ago
                                    </Fact>
                                </Facts>
                            </div>
                        )}
                    </Swap>
                </Group>
            </Specimen>

            <Specimen
                title="A list keeps its place"
                rule="A row that leaves lets the rows after it travel up; a row that arrives wears the ink's tint for long enough to be found, and a removal's undo brings the row back to its place. A table's rows are SettlingTrs. A list that draws only the rows in view gives its SettlingRows the revision of the whole list, so rows that scroll past are not taken for rows that moved."
                framed={false}
            >
                <Projects onAdd={() => setArrivals(arrivals + 1)} />
                <Tasks />
                <Exports />
            </Specimen>

            <Specimen
                title="Something arrives"
                rule="A surface that mounts settles once, with a breath of rise; related ones follow a stagger apart."
            >
                <div key={arrivals} className="flex gap-4">
                    {[0, 1, 2].map((depth) => (
                        <m.div
                            key={depth}
                            {...arrive(depth)}
                            className="grid size-20 place-items-center rounded-card border border-border bg-sunken text-xs text-text-muted"
                        >
                            {depth + 1}
                        </m.div>
                    ))}
                </div>
            </Specimen>

            <Specimen
                title="A refresh turns"
                rule="A refresh under way turns its mark one whole turn after another, and comes to rest upright when it ends: the turn under way finishes first."
            >
                <Samples>
                    <Sample name="Under way for a few seconds">
                        <Refresh />
                    </Sample>
                </Samples>
            </Specimen>
        </Stack>
    );
}
