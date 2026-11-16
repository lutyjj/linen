import { createContext, type ReactNode, use, useState } from "react";

import {
    createThemeStore,
    type PhoneNav,
    SegmentedControl,
    type ThemePreference,
} from "../src";

const { useTheme } = createThemeStore({ key: "linen:theme" });

const THEMES: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

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

interface Frame {
    hue: string;
    setHue: (hue: string) => void;
    phoneNav: PhoneNav;
    setPhoneNav: (phoneNav: PhoneNav) => void;
    raised: number;
    setRaised: (raised: number) => void;
}

const FrameContext = createContext<Frame | null>(null);

/**
 * The specimen's own choices about its frame, held once: the rail's head
 * and foot offer them on a desk and the Layout page on a phone, as an app's
 * settings hold what its rail does.
 */
export function FrameProvider({ children }: { children: ReactNode }) {
    const [hue, setHueState] = useState("296");
    const [phoneNav, setPhoneNav] = useState<PhoneNav>("bottom");
    const [raised, setRaised] = useState(0);
    const setHue = (next: string) => {
        document.documentElement.style.setProperty("--hue", next);
        setHueState(next);
    };
    return (
        <FrameContext
            value={{ hue, setHue, phoneNav, setPhoneNav, raised, setRaised }}
        >
            {children}
        </FrameContext>
    );
}

export function useFrame(): Frame {
    const frame = use(FrameContext);
    if (frame === null) throw new Error("useFrame outside FrameProvider");
    return frame;
}

export function ThemeChoice() {
    const { preference, setPreference } = useTheme();
    return (
        <SegmentedControl
            label="Theme"
            value={preference}
            options={THEMES}
            onValueChange={setPreference}
        />
    );
}

export function HueChoice() {
    const { hue, setHue } = useFrame();
    return (
        <SegmentedControl
            label="Hue"
            value={hue}
            options={HUES}
            onValueChange={setHue}
        />
    );
}

export function PhoneNavChoice() {
    const { phoneNav, setPhoneNav } = useFrame();
    return (
        <SegmentedControl
            label="Phone navigation"
            value={phoneNav}
            options={PHONE_NAVS}
            onValueChange={setPhoneNav}
        />
    );
}

export function RaisedChoice() {
    const { raised, setRaised } = useFrame();
    return (
        <SegmentedControl
            label="Conditions"
            value={String(raised)}
            options={RAISED}
            onValueChange={(next) => setRaised(Number(next))}
        />
    );
}
