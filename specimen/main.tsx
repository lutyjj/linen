import "./specimen.css";

import {
    Blocks,
    MousePointerClick,
    Palette,
    Sparkles,
    SwatchBook,
} from "lucide-react";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router";

import {
    AccountMenu,
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
    TopBar,
} from "../src";
import { ControlsSection } from "./ControlsSection";
import { FeedbackSection } from "./FeedbackSection";
import { FoundationsSection } from "./FoundationsSection";
import { LayoutSection } from "./LayoutSection";
import { MotionSection } from "./MotionSection";

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
        to: "/motion",
        label: "Motion",
        icon: Palette,
        element: <MotionSection />,
    },
] as const;

const PLACES: readonly Place[] = SCREENS.map(({ to, label, icon }) => ({
    to,
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

const THEMES: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

function Specimen() {
    const { pathname } = useLocation();
    const { preference, setPreference } = useTheme();
    const [hue, setHue] = useState("296");
    const [phoneNav, setPhoneNav] = useState<PhoneNav>("bottom");
    const screen = SCREENS.find((one) => pathname.startsWith(one.to));

    const changeHue = (next: string) => {
        document.documentElement.style.setProperty("--hue", next);
        setHue(next);
    };

    return (
        <Shell
            label="Specimen"
            places={PLACES}
            storageKey="linen:rail"
            home={{ to: "/foundations", label: "linen" }}
            phoneNav={phoneNav}
            screen={screen?.to}
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
                        onChange={changeHue}
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
                            onChange={setPreference}
                        />
                    </MenuChoice>
                    <MenuChoice label="Phone navigation">
                        <SegmentedControl
                            label="Phone navigation"
                            value={phoneNav}
                            options={PHONE_NAVS}
                            onChange={setPhoneNav}
                        />
                    </MenuChoice>
                </AccountMenu>
            }
        >
            <TopBar title={screen?.label ?? "linen"} />
            <Content>
                <Routes>
                    {SCREENS.map(({ to, element }) => (
                        <Route key={to} path={to} element={element} />
                    ))}
                    <Route
                        path="*"
                        element={<Navigate to="/foundations" replace />}
                    />
                </Routes>
            </Content>
        </Shell>
    );
}

const root = document.getElementById("root");
if (root === null) throw new Error("no #root element");
createRoot(root).render(
    <StrictMode>
        <LinenProvider>
            <BrowserRouter>
                <Specimen />
            </BrowserRouter>
        </LinenProvider>
    </StrictMode>,
);
