import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronLeft, ChevronRight, PanelLeft, Trash2 } from "lucide-react";
import { useState } from "react";

import {
    Actions,
    Button,
    Card,
    CardBody,
    CardHead,
    Chip,
    CopyValue,
    Count,
    DisclosurePanel,
    EmptyState,
    FormBand,
    IconButton,
    PickerMark,
    SearchField,
    SegmentedControl,
    SettingNote,
    SettingRow,
    SettingToggle,
    TextField,
    TitleField,
    TopBar,
    TopBarLead,
} from "../src";
import { HueChoice, PhoneNavChoice, RaisedChoice, ThemeChoice } from "./frame";
import { Specimen, Stack } from "./Specimen";

export function LayoutSection() {
    const [weekly, setWeekly] = useState(true);
    const [writing, setWriting] = useState(false);
    const [density, setDensity] = useState("comfortable");
    const [format, setFormat] = useState("csv");
    const [name, setName] = useState("Quarterly report");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [period, setPeriod] = useState("week");

    return (
        <Stack>
            <Specimen
                title="The frame"
                rule="On a desk the rail holds the places, a choice at its head, and its foot: the account menu and choices beside it. A phone's bar holds the places alone, so what the rail's head and foot hold has a place on a screen as well, as these rows hold this specimen's."
                framed={false}
            >
                <Card>
                    <CardHead title="This specimen" />
                    <SettingRow
                        title="Theme"
                        description="Auto follows this device. Kept in this browser."
                    >
                        <ThemeChoice />
                    </SettingRow>
                    <SettingRow title="Hue">
                        <HueChoice />
                    </SettingRow>
                    <SettingRow
                        title="Phone navigation"
                        description="Where a phone shows the places."
                    >
                        <PhoneNavChoice />
                    </SettingRow>
                    <SettingRow
                        title="Conditions"
                        description="How many of the app's conditions stand at the top of every page."
                    >
                        <RaisedChoice />
                    </SettingRow>
                </Card>
            </Specimen>

            <Specimen
                title="A screen's actions"
                rule="The actions stand beside the title while the title and what reads beside it keep their own width, up to a share of the line, and wrap below it past that. Narrow the window to a phone's width: a short title keeps them beside it. A lead the shell hands in stands before the title, and the lead and the actions stand on the title's first line however many it takes."
                framed={false}
            >
                {["Reports", "Quarterly reports for every region"].map(
                    (title) => (
                        <div
                            key={title}
                            className="overflow-hidden rounded-card border border-border"
                        >
                            <TopBar title={title}>
                                <IconButton aria-label="Previous week">
                                    <ChevronLeft
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </IconButton>
                                <Button>9 March</Button>
                                <IconButton aria-label="Next week">
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </IconButton>
                            </TopBar>
                        </div>
                    ),
                )}
                <div className="overflow-hidden rounded-card border border-border">
                    <TopBarLead
                        value={
                            <IconButton aria-label="Folders">
                                <PanelLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </IconButton>
                        }
                    >
                        <TopBar
                            title="Quarterly reports for every region"
                            meta={<Chip tone="accent">Draft</Chip>}
                        >
                            <Button>Export</Button>
                        </TopBar>
                    </TopBarLead>
                </div>
            </Specimen>

            <Specimen
                title="A screen beneath another"
                rule="A top bar with room, 50rem or more, names the screens above it in a small trail before the title, on the title's line: two steps as links, or the nearest after one button the outer ones fold behind. The trail gives way first when the line is full. In a narrower bar a chevron where the lead stands leads up a level. An editable name stands where the title does, as wide as its words."
                framed={false}
            >
                <div className="overflow-hidden rounded-card border border-border">
                    <TopBar
                        trail={[
                            { href: "/foundations", label: "Settings" },
                            { href: "/layout", label: "Reports" },
                        ]}
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
                            { href: "/foundations", label: "Settings" },
                            { href: "/controls", label: "Integrations" },
                            { href: "/layout", label: "Webhooks" },
                        ]}
                        title="Nightly export for every region"
                        meta={<Chip tone="accent">Scheduled</Chip>}
                    >
                        <IconButton variant="destructive" aria-label="Delete">
                            <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                        <Button variant="primary">Run now</Button>
                    </TopBar>
                </div>
            </Specimen>

            <Specimen
                title="A card and its head"
                rule="One concern per card. The head holds its title, a count beside it, what it is for, and its actions, which sit beside the title while the title keeps its own width beside them, and under what the card is for once it would not. Every title and value inside starts on the gutter."
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
                <Card>
                    <CardHead
                        title="Scheduled exports"
                        aside={<Count>48</Count>}
                        description="Every report a schedule has written, newest first."
                    >
                        <SearchField
                            label="Search exports"
                            placeholder="Search exports"
                            value={query}
                            onValueChange={setQuery}
                            className="grow"
                        />
                        <SegmentedControl
                            label="Status"
                            value={status}
                            options={[
                                { value: "all", label: "All" },
                                { value: "written", label: "Written" },
                                { value: "failed", label: "Failed" },
                            ]}
                            onValueChange={setStatus}
                        />
                        <SegmentedControl
                            label="Period"
                            value={period}
                            options={[
                                { value: "week", label: "Week" },
                                { value: "month", label: "Month" },
                                { value: "quarter", label: "Quarter" },
                                { value: "year", label: "Year" },
                            ]}
                            onValueChange={setPeriod}
                        />
                        <Actions className="flex-nowrap">
                            <IconButton aria-label="Previous period">
                                <ChevronLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </IconButton>
                            <Button>9 March</Button>
                            <IconButton aria-label="Next period">
                                <ChevronRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </IconButton>
                        </Actions>
                        <Button>Download all</Button>
                        <Button variant="primary">New export</Button>
                    </CardHead>
                    <CardBody className="text-sm text-text-secondary">
                        Actions too wide to stand beside the title go under what
                        the card is for, as on a phone.
                    </CardBody>
                </Card>
            </Specimen>

            <Specimen
                title="A setting is a row"
                rule="A setting's name, what it does, and its control at the end of the row while the control fits beside the words, below them once it does not, so a wide control never squeezes them. A switch keeps the end of the row at every width."
                framed={false}
            >
                <Card>
                    <CardHead title="Reports" />
                    <SettingRow
                        title="Density"
                        description="How close the rows of a report sit."
                    >
                        <SegmentedControl
                            label="Density"
                            value={density}
                            options={[
                                { value: "comfortable", label: "Comfortable" },
                                { value: "compact", label: "Compact" },
                            ]}
                            onValueChange={setDensity}
                        />
                    </SettingRow>
                    <SettingToggle
                        title="Weekly summary"
                        description="Each project's progress, by email every Monday. It is written as it turns, and holds while it is."
                        label="Weekly summary"
                        checked={weekly}
                        busy={writing}
                        onCheckedChange={(next) => {
                            setWriting(true);
                            setTimeout(() => {
                                setWeekly(next);
                                setWriting(false);
                            }, 1600);
                        }}
                    />
                    <SettingRow
                        title="Export from a terminal"
                        description="Tonight's report, with a token from Access tokens."
                    >
                        <CopyValue
                            value='curl -H "Authorization: Bearer $REPORTS_TOKEN" https://reports.example.com/api/exports/nightly'
                            label="Export command"
                        />
                    </SettingRow>
                    <SettingRow title="Role">
                        <Chip size="row">Administrator</Chip>
                    </SettingRow>
                    <SettingNote>
                        The deployment sets these; change them there.
                    </SettingNote>
                </Card>
                <Card>
                    <SettingRow
                        title="Export format"
                        description="A card of one setting needs no head; its edge draws the row's line."
                    >
                        <SegmentedControl
                            label="Export format"
                            value={format}
                            options={[
                                { value: "csv", label: "CSV" },
                                { value: "json", label: "JSON" },
                            ]}
                            onValueChange={setFormat}
                        />
                    </SettingRow>
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
                    description="A project keeps its tasks, files and people in one place."
                >
                    <Button variant="primary">New project</Button>
                </EmptyState>
            </Specimen>
        </Stack>
    );
}
