import { m } from "motion/react";
import { useState } from "react";

import {
    arrive,
    Button,
    Card,
    CardHead,
    SegmentedControl,
    SettlingItem,
    SettlingRows,
    Swap,
} from "../src";
import { Group, Specimen, Stack } from "./Specimen";

const NAMES = ["Atlas", "Harbor", "Orchard", "Lantern", "Meadow", "Summit"];

export function MotionSection() {
    const [view, setView] = useState<"image" | "facts">("image");
    const [rows, setRows] = useState(NAMES.slice(0, 3));
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
                        onChange={setView}
                    />
                </Group>
                <Group name="A view swaps">
                    <div className="max-w-md rounded-card border border-border">
                        <Swap view={view}>
                            {view === "image" ? (
                                <div className="grid h-40 place-items-center bg-sunken text-sm text-text-muted">
                                    The project's cover
                                </div>
                            ) : (
                                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 p-4 text-sm">
                                    <dt className="text-text-muted">Owner</dt>
                                    <dd>Ada</dd>
                                    <dt className="text-text-muted">Status</dt>
                                    <dd>On track</dd>
                                    <dt className="text-text-muted">
                                        Open tasks
                                    </dt>
                                    <dd>24</dd>
                                    <dt className="text-text-muted">
                                        Last update
                                    </dt>
                                    <dd>4 minutes ago</dd>
                                </dl>
                            )}
                        </Swap>
                    </div>
                </Group>
            </Specimen>

            <Specimen
                title="A list keeps its place"
                rule="A row that leaves lets the rows after it travel up; a row that arrives wears the ink's tint for long enough to be found."
                framed={false}
            >
                <Card className="max-w-md">
                    <CardHead title="Projects">
                        <Button
                            disabled={rows.length === NAMES.length}
                            onClick={() => {
                                const next = NAMES.find(
                                    (name) => !rows.includes(name),
                                );
                                if (next !== undefined) {
                                    setRows([...rows, next]);
                                    setArrivals(arrivals + 1);
                                }
                            }}
                        >
                            Add
                        </Button>
                    </CardHead>
                    <SettlingRows scope="projects" marksArrivals>
                        {rows.map((name) => (
                            <SettlingItem
                                key={name}
                                className="flex items-center justify-between border-t border-border px-gutter py-2.5 text-sm first:border-t-0"
                            >
                                {name}
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        setRows(
                                            rows.filter((row) => row !== name),
                                        )
                                    }
                                >
                                    Remove
                                </Button>
                            </SettlingItem>
                        ))}
                    </SettlingRows>
                </Card>
            </Specimen>

            <Specimen
                title="Something arrives"
                rule="A surface that mounts settles once, with a breath of rise; related ones follow a stagger apart."
            >
                <div key={arrivals} className="flex gap-3">
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
        </Stack>
    );
}
