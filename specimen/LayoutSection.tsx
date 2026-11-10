import { Collapsible } from "@base-ui/react/collapsible";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardHead,
    Chip,
    Count,
    DisclosurePanel,
    EmptyState,
    FormBand,
    IconButton,
    PickerMark,
    SegmentedControl,
    SettingNote,
    SettingRow,
    SettingToggle,
    TextField,
    TitleField,
    TopBar,
} from "../src";
import { Specimen, Stack } from "./Specimen";

export function LayoutSection() {
    const [weekly, setWeekly] = useState(true);
    const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
    const [name, setName] = useState("Quarterly report");

    return (
        <Stack>
            <Specimen
                title="A screen beneath another"
                rule="Its top bar names the screens above it in a small trail over the title, each a link. Past two steps the outer ones fold behind one button. An editable name stands where the title does, as wide as its words."
                framed={false}
            >
                <div className="overflow-hidden rounded-card border border-border">
                    <TopBar
                        trail={[{ to: "/layout", label: "Reports" }]}
                        title={
                            <TitleField
                                aria-label="Report name"
                                value={name}
                                placeholder="Name this report"
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        }
                    >
                        <IconButton variant="destructive" aria-label="Delete">
                            <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                        <Button variant="primary">Save</Button>
                    </TopBar>
                </div>
                <div className="overflow-hidden rounded-card border border-border">
                    <TopBar
                        trail={[
                            { to: "/foundations", label: "Settings" },
                            { to: "/controls", label: "Integrations" },
                            { to: "/layout", label: "Webhooks" },
                        ]}
                        title="Nightly export"
                    />
                </div>
            </Specimen>

            <Specimen
                title="A card and its head"
                rule="One concern per card. The head holds its title, a count beside it, what it is for, and its actions, which sit beside the title while there is room and under the words once there is not. Every title and value inside starts on the gutter."
                framed={false}
            >
                <Card>
                    <CardHead
                        title="Access tokens"
                        aside={<Count>2</Count>}
                        description="Scripts and other services send a token instead of signing in."
                    >
                        <Button variant="primary">New token</Button>
                    </CardHead>
                    <FormBand>
                        <div className="max-w-sm">
                            <TextField
                                label="Name"
                                placeholder="Nightly export"
                            />
                        </div>
                    </FormBand>
                    <CardBody className="text-sm text-text-secondary">
                        A sunken band holds a form opened inside the card.
                    </CardBody>
                </Card>
            </Specimen>

            <Specimen
                title="A setting is a row"
                rule="A setting's name, what it does, and its control at the end of the row while the row has room, below the words once it does not. A switch keeps the end of the row at every width."
                framed={false}
            >
                <Card>
                    <CardHead title="Appearance" />
                    <SettingRow
                        title="Theme"
                        description="Auto follows this device. Kept in this browser."
                    >
                        <SegmentedControl
                            label="Theme"
                            value={theme}
                            options={[
                                { value: "system", label: "Auto" },
                                { value: "light", label: "Light" },
                                { value: "dark", label: "Dark" },
                            ]}
                            onChange={setTheme}
                        />
                    </SettingRow>
                    <SettingToggle
                        title="Weekly summary"
                        description="Each project's progress, by email every Monday."
                        label="Weekly summary"
                        checked={weekly}
                        onCheckedChange={setWeekly}
                    />
                    <SettingRow title="Role">
                        <Chip size="row">Administrator</Chip>
                    </SettingRow>
                    <SettingNote>
                        The deployment sets these; change them there.
                    </SettingNote>
                </Card>
            </Specimen>

            <Specimen
                title="A panel unfolds"
                rule="Details a control shows and hides unfold from it and fold back faster. Its mark turns as it opens."
            >
                <Collapsible.Root className="max-w-md">
                    <Collapsible.Trigger className="flex cursor-pointer items-center gap-1.5 text-sm font-medium">
                        Advanced
                        <PickerMark />
                    </Collapsible.Trigger>
                    <DisclosurePanel>
                        <p className="pt-2 text-sm text-text-secondary">
                            What the panel holds mounts only while it is open.
                        </p>
                    </DisclosurePanel>
                </Collapsible.Root>
            </Specimen>

            <Specimen
                title="Nothing yet"
                rule="An empty screen says what would be here and offers the way to start."
                framed={false}
            >
                <EmptyState
                    title="No projects yet"
                    detail="A project keeps its tasks, files and people in one place."
                >
                    <Button variant="primary">New project</Button>
                </EmptyState>
            </Specimen>
        </Stack>
    );
}
