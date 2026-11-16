import { useEffect, useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardHead,
    DialogLayout,
    DialogRoot,
    DialogShell,
    Fact,
    Facts,
    LogView,
    NumberField,
    Progress,
    SettingRow,
    Steps,
} from "../src";
import { Sample, Samples, Specimen, Stack } from "./Specimen";

const SETUP = [
    { id: "address", label: "Address" },
    { id: "secret", label: "Secret" },
    { id: "test", label: "Test" },
];

const BODY: Record<string, string> = {
    address: "Where the webhook is sent.",
    secret: "What signs each request, so the other side can trust it.",
    test: "One request is sent, and its answer shown.",
};

/** A key's fingerprint, too long to stand beside its name on a phone. */
const SIGNING_KEY =
    "3f9a6c1e8b2d47f0a5e9c3b1d6f8a2e4c7b9d1f3a5e7c9b2d4f6a8c1e3b5d7f9";

/** A line a service might write, made up for the specimen. */
function line(count: number): string {
    const at = new Date(Date.UTC(2026, 0, 1, 12, 0, count)).toISOString();
    return `${at} worker ${count % 3} handled request ${1000 + count} in ${(count * 7) % 90} ms`;
}

export function TasksSection() {
    const [level, setLevel] = useState<number | null>(-18);
    const [done, setDone] = useState(0.35);
    const [step, setStep] = useState<string | null>(null);
    const [lines, setLines] = useState(() =>
        Array.from({ length: 12 }, (_, at) => line(at)),
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setDone((was) => (was >= 1 ? 0 : Math.min(1, was + 0.05)));
            setLines((was) => [...was, line(was.length)].slice(-400));
        }, 900);
        return () => clearInterval(timer);
    }, []);

    const at = SETUP.findIndex((one) => one.id === step);
    const next = SETUP[at + 1];
    const back = SETUP[at - 1];

    return (
        <Stack>
            <Specimen
                title="A number in a range"
                rule="A number set within a range moves in steps: the arrows and its buttons take one, Shift or Page Up and Page Down take ten, Home and End go to either end. Its unit stands inside the frame, after it."
            >
                <div className="max-w-xs">
                    <NumberField
                        label="Volume"
                        hint="From −60 to 0."
                        unit="dB"
                        min={-60}
                        max={0}
                        value={level}
                        onValueChange={setLevel}
                    />
                </div>
            </Specimen>

            <Specimen
                title="Progress in place"
                rule="Something under way says its phase in words over a bar that fills. One that cannot tell how far sends a stretch along the bar."
            >
                <div className="flex max-w-md flex-col gap-5">
                    <Progress
                        label={done < 0.7 ? "Uploading" : "Verifying"}
                        value={done}
                    />
                    <Progress label="Waiting for the other side" />
                </div>
            </Specimen>

            <Specimen
                title="A task of known steps"
                rule="A task of known steps shows each done, the one under way and the ones to come, with Back, Cancel and the next step as its buttons. It can open at any step, as a task resumed later does, in a dialog or on a screen of its own."
            >
                <Samples>
                    <Sample name="From the start">
                        <Button onClick={() => setStep("address")}>
                            Add a webhook
                        </Button>
                    </Sample>
                    <Sample name="Resumed">
                        <Button onClick={() => setStep("test")}>
                            Finish setting up
                        </Button>
                    </Sample>
                </Samples>
                <Card className="max-w-xl">
                    <CardHead title="On a screen of its own" />
                    <CardBody className="flex flex-col gap-4">
                        <Steps label="Setup" steps={SETUP} current="secret" />
                        <p className="text-sm text-text-secondary">
                            {BODY.secret}
                        </p>
                    </CardBody>
                </Card>
                <DialogRoot
                    open={step !== null}
                    onOpenChange={(open) => !open && setStep(null)}
                >
                    <DialogShell open={step !== null} width="32rem">
                        <DialogLayout
                            title="Add a webhook"
                            actions={
                                <>
                                    <Button onClick={() => setStep(null)}>
                                        Cancel
                                    </Button>
                                    {back !== undefined && (
                                        <Button
                                            onClick={() => setStep(back.id)}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={() =>
                                            setStep(
                                                next === undefined
                                                    ? null
                                                    : next.id,
                                            )
                                        }
                                    >
                                        {next === undefined ? "Finish" : "Next"}
                                    </Button>
                                </>
                            }
                        >
                            <Steps
                                label="Setup"
                                steps={SETUP}
                                current={step ?? "address"}
                                className="mb-4"
                            />
                            <p className="text-sm text-text-secondary">
                                {BODY[step ?? "address"]}
                            </p>
                        </DialogLayout>
                    </DialogShell>
                </DialogRoot>
            </Specimen>

            <Specimen
                title="Facts and machine text"
                rule="Facts are names and values read at a glance: each name starts its line and its value ends it, where a setting's control stands, so a card's values and controls share an edge, and a value too long to stand beside its name goes under it. A value typed exactly is set in mono and taken whole. Text a machine writes stands in a box that follows new lines until the reader scrolls up, and is copied or saved whole."
                framed={false}
            >
                <Card>
                    <CardHead
                        title="Export service"
                        description="What runs the nightly export."
                    />
                    <CardBody>
                        <Facts>
                            <Fact name="Version">2.4.1</Fact>
                            <Fact
                                name="Address"
                                mono
                                copy={{ value: "192.0.2.10", label: "Address" }}
                            >
                                192.0.2.10
                            </Fact>
                            <Fact name="Running for">3 days, 4 hours</Fact>
                            <Fact
                                name="Signing key"
                                mono
                                copy={{
                                    value: SIGNING_KEY,
                                    label: "Signing key",
                                }}
                            >
                                {SIGNING_KEY}
                            </Fact>
                        </Facts>
                    </CardBody>
                    <SettingRow
                        title="Restart"
                        description="Exports that are waiting start again once it is back."
                    >
                        <Button>Restart</Button>
                    </SettingRow>
                </Card>
                <Card>
                    <CardBody>
                        <LogView
                            label="Service log"
                            text={lines.join("\n")}
                            filename="service.log"
                        />
                    </CardBody>
                </Card>
            </Specimen>
        </Stack>
    );
}
