import { useState } from "react";

import {
    Button,
    ConfirmDialog,
    FormDialog,
    OptionCards,
    PromptDialog,
    ShownOnce,
    TextField,
    useToast,
} from "../src";
import { Group, Sample, Samples, Specimen, Stack } from "./Specimen";

export function FeedbackSection() {
    const toast = useToast();
    const [confirming, setConfirming] = useState(false);
    const [asking, setAsking] = useState(false);
    const [making, setMaking] = useState(false);
    const [name, setName] = useState("");
    const [removing, setRemoving] = useState(false);
    const [removal, setRemoval] = useState<"archive" | "delete">("archive");

    return (
        <Stack>
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
                            onClick={() => setMaking(true)}
                        >
                            New token
                        </Button>
                    </Sample>
                    <Sample name="Prompt">
                        <Button onClick={() => setAsking(true)}>Rename</Button>
                    </Sample>
                </Samples>
                <ConfirmDialog
                    open={confirming}
                    onOpenChange={setConfirming}
                    title="Revoke the nightly export's token?"
                    detail="Whatever uses it stops working at once."
                    confirmLabel="Revoke"
                    destructive
                    onConfirm={() => toast.show({ text: "Token revoked" })}
                />
                <ConfirmDialog
                    open={removing}
                    onOpenChange={setRemoving}
                    title="Remove Atlas?"
                    detail="Its members keep their accounts either way."
                    confirmLabel={removal === "delete" ? "Delete" : "Archive"}
                    destructive
                    onConfirm={() => toast.show({ text: "Atlas removed" })}
                >
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
                </ConfirmDialog>
                <FormDialog
                    open={making}
                    onOpenChange={setMaking}
                    title="New access token"
                    description="It acts as you until you revoke it."
                    submitLabel="Create token"
                    disabled={name.trim() === ""}
                    onSubmit={() => {
                        setMaking(false);
                        toast.show({ text: `${name} created` });
                    }}
                >
                    <TextField
                        label="Name"
                        hint="What will hold it, so you know which to revoke."
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
                    onConfirm={(name) =>
                        toast.show({ text: `Renamed ${name}` })
                    }
                />
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
                    >
                        Give it to the script that will use it.
                    </ShownOnce>
                </Group>
            </Specimen>
        </Stack>
    );
}
