import "./app.css";

import {
    Button,
    Card,
    CardBody,
    CardHead,
    Chip,
    ConfirmDialog,
    Content,
    EmptyState,
    LinenProvider,
    SegmentedControl,
    Select,
    SettingToggle,
    Shell,
    TextField,
    TopBar,
} from "linen";
import { Folder, Settings } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const PLACES = [
    { href: "/", label: "Projects", icon: Folder, exact: true },
    { href: "/settings", label: "Settings", icon: Settings },
];

const SIZES = [
    { value: "small", label: "Small" },
    { value: "large", label: "Large" },
];

function App() {
    const [name, setName] = useState("Atlas");
    const [size, setSize] = useState("small");
    const [shared, setShared] = useState(false);
    const [asking, setAsking] = useState(false);
    return (
        <Shell
            label="Places"
            places={PLACES}
            home={{ href: "/", label: "Example" }}
            wordmark="Example"
            storageKey="example:rail"
        >
            <TopBar title="Projects" meta={<Chip tone="accent">Live</Chip>} />
            <Content>
                <Card>
                    <CardHead title="Atlas" description="A project">
                        <Button onClick={() => setAsking(true)}>Remove</Button>
                    </CardHead>
                    <CardBody>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <Select
                            label="Size"
                            choices={SIZES}
                            value={size}
                            onValueChange={setSize}
                        />
                        <SegmentedControl
                            label="Size"
                            value={size}
                            options={SIZES}
                            onValueChange={setSize}
                        />
                    </CardBody>
                    <SettingToggle
                        title="Shared"
                        label="Shared"
                        checked={shared}
                        onCheckedChange={setShared}
                    />
                </Card>
                <EmptyState title="No projects yet" />
                <ConfirmDialog
                    open={asking}
                    onOpenChange={setAsking}
                    title="Remove Atlas?"
                    confirmLabel="Remove"
                    destructive
                    onConfirm={() => setAsking(false)}
                />
            </Content>
        </Shell>
    );
}

const root = document.getElementById("root");
if (root === null) throw new Error("no #root element");
createRoot(root).render(
    <LinenProvider>
        <App />
    </LinenProvider>,
);
