import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { createThemeStore } from "./theme";

const BAR = { light: "#fafafa", dark: "#111111" };

afterEach(() => vi.restoreAllMocks());

beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.head.innerHTML = `
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="">
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="">`;
});

function bars() {
    return [
        ...document.querySelectorAll<HTMLMetaElement>(
            'meta[name="theme-color"]',
        ),
    ].map((meta) => meta.content);
}

it("applies the stored preference as the store is made", () => {
    localStorage.setItem("app:theme", "dark");
    createThemeStore({ key: "app:theme", bar: BAR });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(bars()).toEqual([BAR.dark, BAR.dark]);
});

it("pins a theme, and lets go of it for the system's", () => {
    const { useTheme } = createThemeStore({ key: "app:theme", bar: BAR });
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");

    act(() => result.current.setPreference("light"));
    expect(result.current.preference).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("app:theme")).toBe("light");
    expect(bars()).toEqual([BAR.light, BAR.light]);

    act(() => result.current.setPreference("system"));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem("app:theme")).toBeNull();
    expect(bars()).toEqual([BAR.light, BAR.dark]);
});

it("ignores a stored value it does not know", () => {
    localStorage.setItem("app:theme", "sepia");
    const { current } = createThemeStore({ key: "app:theme" });
    expect(current()).toBe("system");
    expect(document.documentElement.dataset.theme).toBeUndefined();
});

it("still applies a theme where the browser refuses storage", () => {
    const refused = () => {
        throw new DOMException("refused", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(refused);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(refused);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(refused);

    const { useTheme } = createThemeStore({ key: "app:theme" });
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setPreference("dark"));

    expect(result.current.preference).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
});
