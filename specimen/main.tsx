import "./specimen.css";

import {
    Blocks,
    ListChecks,
    MousePointerClick,
    Palette,
    Sparkles,
    SwatchBook,
} from "lucide-react";
import { StrictMode, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
    AccountMenu,
    Button,
    Content,
    createThemeStore,
    LinenProvider,
    MenuChoice,
    type PhoneNav,
    type Place,
    RailChoice,
    SegmentedControl,
    Shell,
    type ThemePreference,
    ToastProvider,
    TopBar,
} from "../src";
import { ControlsSection } from "./ControlsSection";
import { FeedbackSection } from "./FeedbackSection";
import { FoundationsSection } from "./FoundationsSection";
import { LayoutSection } from "./LayoutSection";
import { MotionSection } from "./MotionSection";
import { historyNavigation, navigate } from "./navigation";
import { TasksSection } from "./TasksSection";

const { useTheme } = createThemeStore({ key: "linen:theme" });

const SCREENS = [
    {
        to: "/foundations",
        label: "Foundations",
        icon: SwatchBook,
        element: <FoundationsSection />,
    },
    {
        to: "/controls",
        label: "Controls",
        icon: MousePointerClick,
        element: <ControlsSection />,
    },
    {
        to: "/layout",
        label: "Layout",
        icon: Blocks,
        element: <LayoutSection />,
    },
    {
        to: "/feedback",
        label: "Feedback",
        icon: Sparkles,
        element: <FeedbackSection />,
    },
    {
        to: "/tasks",
        label: "Tasks",
        icon: ListChecks,
        element: <TasksSection />,
    },
    {
        to: "/motion",
        label: "Motion",
        icon: Palette,
        element: <MotionSection />,
    },
] as const;

const PLACES: readonly Place[] = SCREENS.map(({ to, label, icon }) => ({
    href: to,
    label,
    icon,
}));

/** Hues the specimen can be seen in. */
const HUES = [
    { value: "296", label: "Violet" },
    { value: "218", label: "Teal" },
    { value: "150", label: "Green" },
];

/** Where a phone shows the places, to see both in a narrowed window. */
const PHONE_NAVS: { value: PhoneNav; label: string }[] = [
    { value: "bottom", label: "Bottom" },
    { value: "top", label: "Top" },
];

/** How many of the app's conditions the specimen raises on every page. */
const RAISED = [
    { value: "0", label: "None" },
    { value: "1", label: "One" },
    { value: "2", label: "Two" },
];

const THEMES: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

function Specimen() {
    const pathname = historyNavigation.usePathname();
    const { preference, setPreference } = useTheme();
    const [hue, setHue] = useState("296");
    const [phoneNav, setPhoneNav] = useState<PhoneNav>("bottom");
    const [raised, setRaised] = useState("0");
    const screen = SCREENS.find((one) => pathname.startsWith(one.to));
    // An address the specimen has no page for opens its first page.
    useLayoutEffect(() => {
        if (screen === undefined)
            navigate(PLACES[0]?.href ?? "/", { replace: true });
    }, [screen]);

    const changeHue = (next: string) => {
        document.documentElement.style.setProperty("--hue", next);
        setHue(next);
    };

    return (
        <Shell
            label="Specimen"
            places={PLACES}
            storageKey="linen:rail"
            home={{ href: "/foundations", label: "linen" }}
            phoneNav={phoneNav}
            screen={screen?.to}
            conditions={[
                {
                    id: "service",
                    tone: "danger" as const,
                    title: "The service does not answer.",
                    action: (
                        <Button onClick={() => setRaised("0")}>
                            Try again
                        </Button>
                    ),
                },
                {
                    id: "storage",
                    tone: "warn" as const,
                    title: "Read only while storage is nearly full.",
                },
            ].slice(0, Number(raised))}
            wordmark={
                <span className="font-display text-md font-semibold">
                    linen
                </span>
            }
            head={
                <RailChoice icon={Palette} label="Hue">
                    <SegmentedControl
                        label="Hue"
                        value={hue}
                        options={HUES}
                        onValueChange={changeHue}
                    />
                </RailChoice>
            }
            foot={
                <AccountMenu
                    name="Specimen"
                    label="Specimen settings"
                    menuLabel="Specimen settings"
                    caption="This browser"
                >
                    <MenuChoice label="Theme">
                        <SegmentedControl
                            label="Theme"
                            value={preference}
                            options={THEMES}
                            onValueChange={setPreference}
                        />
                    </MenuChoice>
                    <MenuChoice label="Conditions">
                        <SegmentedControl
                            label="Conditions"
                            value={raised}
                            options={RAISED}
                            onValueChange={setRaised}
                        />
                    </MenuChoice>
                    <MenuChoice label="Phone navigation">
                        <SegmentedControl
                            label="Phone navigation"
                            value={phoneNav}
                            options={PHONE_NAVS}
                            onValueChange={setPhoneNav}
                        />
                    </MenuChoice>
                </AccountMenu>
            }
        >
            <TopBar title={screen?.label ?? "linen"} />
            <Content>{screen?.element}</Content>
        </Shell>
    );
}

const root = document.getElementById("root");
if (root === null) throw new Error("no #root element");
createRoot(root).render(
    <StrictMode>
        <LinenProvider navigation={historyNavigation}>
            <ToastProvider>
                <Specimen />
            </ToastProvider>
        </LinenProvider>
    </StrictMode>,
);
