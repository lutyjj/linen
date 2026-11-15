import { expect, it } from "vitest";

import { isCurrent } from "./navigation";

it("names the current place on its own address and beneath it", () => {
    expect(isCurrent("/people", "/people")).toBe(true);
    expect(isCurrent("/people/7", "/people")).toBe(true);
    expect(isCurrent("/people/7", "/people/")).toBe(true);
    expect(isCurrent("/peoples", "/people")).toBe(false);
});

it("holds an exact place to its own address", () => {
    expect(isCurrent("/people", "/people", true)).toBe(true);
    expect(isCurrent("/people/7", "/people", true)).toBe(false);
});

it("never makes the root the current place everywhere", () => {
    expect(isCurrent("/", "/")).toBe(true);
    expect(isCurrent("/people", "/")).toBe(false);
});

it("reads only the path of an address", () => {
    expect(isCurrent("/people", "/people?sort=name")).toBe(true);
    expect(isCurrent("/people", "/people#top")).toBe(true);
});

it("matches letters in either case, as routers match their routes", () => {
    expect(isCurrent("/Settings/people", "/settings")).toBe(true);
});
