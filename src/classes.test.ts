import { describe, expect, it } from "vitest";

import { classes } from "./classes";

describe("class names", () => {
    it("lets the caller's word win over the component's own", () => {
        expect(classes("h-11 px-4 text-sm", "px-2")).toBe("h-11 text-sm px-2");
    });

    it("keeps what does not conflict", () => {
        expect(classes("border-b border-border", "text-right")).toBe(
            "border-b border-border text-right",
        );
    });

    it("reads text-hero as the size it is, not as a colour", () => {
        expect(classes("text-hero text-danger")).toBe("text-hero text-danger");
        expect(classes("text-hero", "text-lg")).toBe("text-lg");
    });

    it("keeps one radius, whichever was said last", () => {
        expect(classes("rounded-card", "rounded-input")).toBe("rounded-input");
    });

    it("reads the gutter as a step of the spacing scale", () => {
        expect(classes("first:pl-gutter px-3", "first:pl-0 px-0")).toBe(
            "first:pl-0 px-0",
        );
    });

    it("drops the empty strings a conditional leaves behind", () => {
        expect(classes("text-sm", "", undefined, false)).toBe("text-sm");
    });
});
