import "./specimen.css";

import {
    Blocks,
    ListChecks,
    MousePointerClick,
    Palette,
    Sparkles,
    SunMoon,
    SwatchBook,
} from "lucide-react";
import { StrictMode, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";

import {
    AccountMenu,
    Button,
    Content,
    LinenProvider,
    MenuChoice,
    type Place,
    RailChoice,
    Shell,
    ToastProvider,
    TopBar,
} from "../src";
import { ControlsSection } from "./ControlsSection";
import { FeedbackSection } from "./FeedbackSection";
import { FoundationsSection } from "./FoundationsSection";
import {
    FrameProvider,
    HueChoice,
    PhoneNavChoice,
    RaisedChoice,
    ThemeChoice,
    useFrame,
    WordmarkChoice,
} from "./frame";
import { LayoutSection } from "./LayoutSection";
import { MotionSection } from "./MotionSection";
import { historyNavigation, navigate } from "./navigation";
import { TasksSection } from "./TasksSection";

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

function Specimen() {
    const pathname = historyNavigation.usePathname();
    const { phoneNav, raised, setRaised, wordmark } = useFrame();
    const screen = SCREENS.find((one) => pathname.startsWith(one.to));
    // An address the specimen has no page for opens its first page.
    useLayoutEffect(() => {
        if (screen === undefined)
            navigate(PLACES[0]?.href ?? "/", { replace: true });
    }, [screen]);

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
                        <Button onClick={() => setRaised(0)}>Try again</Button>
                    ),
                },
                {
                    id: "storage",
                    tone: "warn" as const,
                    title: "Read only while storage is nearly full.",
                },
            ].slice(0, raised)}
            wordmark={
                <span className="font-display text-md font-semibold">
                    {wordmark === "long" ? "linen scheduled exports" : "linen"}
                </span>
            }
            head={
                <RailChoice icon={Palette} label="Hue">
                    <HueChoice />
                </RailChoice>
            }
            foot={
                <>
                    <RailChoice icon={SunMoon} label="Theme">
                        <ThemeChoice />
                    </RailChoice>
                    <AccountMenu
                        name="Specimen"
                        label="Specimen settings"
                        menuLabel="Specimen settings"
                        caption="This browser"
                    >
                        <MenuChoice label="Conditions">
                            <RaisedChoice />
                        </MenuChoice>
                        <MenuChoice label="Phone navigation">
                            <PhoneNavChoice />
                        </MenuChoice>
                        <MenuChoice label="Wordmark">
                            <WordmarkChoice />
                        </MenuChoice>
                    </AccountMenu>
                </>
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
                <FrameProvider>
                    <Specimen />
                </FrameProvider>
            </ToastProvider>
        </LinenProvider>
    </StrictMode>,
);
