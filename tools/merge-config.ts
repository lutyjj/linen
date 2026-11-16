/**
 * Writes src/foundation/merge-config.ts, the configuration `classes()` merges
 * with: tailwind-merge's own, cut to the class groups linen's components
 * write, the groups whose classes override those, and every group sharing a
 * prefix with one that takes any value (a colour, a family), so a caller's
 * class on that prefix is read as what it is rather than as a colour.
 *
 * `pnpm run generate` rewrites the file (tools/generate.ts); a test fails
 * while it is stale.
 */
import {
    type Config,
    createTailwindMerge,
    getDefaultConfig,
    mergeConfigs,
    validators,
} from "tailwind-merge";
import ts from "typescript";

/** linen's own steps of Tailwind's scales (src/styles/linen.css). */
export const LINEN_THEME = {
    spacing: ["gutter"],
    text: ["hero"],
    radius: ["check", "input", "button", "card", "dialog"],
    shadow: ["overlay"],
};

/**
 * The files whose words are no classes: tests, the stand-in, the viewport
 * hooks (whose event names, such as "resize", read as classes), this output.
 */
export function holdsClasses(path: string): boolean {
    return !(
        /\.test\.tsx?$/.test(path) ||
        path.includes("/still/") ||
        path.endsWith("/foundation/viewport.ts") ||
        path.endsWith("/foundation/merge-config.ts")
    );
}

/** Every word of every string in linen's sources, comments left out. */
export function words(sources: readonly string[]): Set<string> {
    const found = new Set<string>();
    for (const source of sources) {
        const file = ts.createSourceFile(
            "source.tsx",
            source,
            ts.ScriptTarget.Latest,
            false,
            ts.ScriptKind.TSX,
        );
        const visit = (node: ts.Node) => {
            if (
                ts.isStringLiteral(node) ||
                ts.isNoSubstitutionTemplateLiteral(node) ||
                ts.isTemplateHead(node) ||
                ts.isTemplateMiddle(node) ||
                ts.isTemplateTail(node)
            ) {
                for (const word of node.text.split(/\s+/)) {
                    if (word !== "") found.add(word);
                }
            }
            node.forEachChild(visit);
        };
        visit(file);
    }
    return found;
}

type Groups = Config<string, string>["classGroups"];

/** The full configuration, with linen's steps added to its scales. */
export function fullConfig(): Config<string, string> {
    return mergeConfigs(getDefaultConfig() as Config<string, string>, {
        extend: { theme: LINEN_THEME },
    });
}

/** The first part of each class a group's definition names. */
function prefixes(definition: Groups[string]): Set<string> {
    const found = new Set<string>();
    for (const part of definition) {
        if (typeof part === "string") found.add(part.split("-")[0] ?? part);
        else if (typeof part === "object") {
            for (const key of Object.keys(part)) {
                found.add(key.split("-")[0] ?? key);
            }
        }
    }
    return found;
}

const ANY = validators.isAny as unknown;

/** The key a theme getter reads, found by letting it read one. */
function themeKey(getter: (theme: object) => unknown): string {
    let key = "";
    getter(
        new Proxy(
            {},
            {
                get: (_, name) => {
                    key = String(name);
                    return [];
                },
            },
        ),
    );
    return key;
}

function isThemeGetter(value: unknown): value is (theme: object) => unknown {
    return (
        typeof value === "function" &&
        (value as { isThemeGetter?: boolean }).isThemeGetter === true
    );
}

/** Whether a group takes any value, as a colour or a family does. */
function takesAnything(
    definition: unknown,
    theme: Config<string, string>["theme"],
): boolean {
    if (definition === ANY) return true;
    if (isThemeGetter(definition)) {
        return takesAnything(theme[themeKey(definition)] ?? [], theme);
    }
    if (Array.isArray(definition)) {
        return definition.some((part) => takesAnything(part, theme));
    }
    if (typeof definition === "object" && definition !== null) {
        return Object.values(definition).some((part) =>
            takesAnything(part, theme),
        );
    }
    return false;
}

/** The groups the given words fall in, by the full configuration. */
export function groupsOf(
    found: Iterable<string>,
    config = fullConfig(),
): Set<string> {
    const alone = Object.keys(config.classGroups).map((group) => ({
        group,
        merge: createTailwindMerge(() => ({
            ...config,
            classGroups: { [group]: config.classGroups[group] ?? [] },
            conflictingClassGroups: {},
            conflictingClassGroupModifiers: {},
        })),
    }));
    const groups = new Set<string>();
    for (const word of found) {
        const base = word.slice(word.lastIndexOf(":") + 1).replace(/^!/, "");
        for (const { group, merge } of alone) {
            if (merge(base, base) === base) {
                groups.add(group);
                break;
            }
        }
    }
    return groups;
}

/** The groups linen's configuration keeps, given the groups it writes. */
export function keptGroups(
    written: Set<string>,
    config = fullConfig(),
): Set<string> {
    const kept = new Set(written);
    for (const [group, conflicts] of Object.entries(
        config.conflictingClassGroups,
    )) {
        if (conflicts?.some((conflict) => written.has(conflict)))
            kept.add(group);
    }
    const open = new Set<string>();
    for (const group of [...kept]) {
        const definition = config.classGroups[group];
        if (definition !== undefined && takesAnything(definition, config.theme))
            for (const prefix of prefixes(definition)) open.add(prefix);
    }
    for (const [group, definition] of Object.entries(config.classGroups)) {
        if ([...prefixes(definition)].some((prefix) => open.has(prefix)))
            kept.add(group);
    }
    return kept;
}

function names(): Map<unknown, string> {
    return new Map(
        Object.entries(validators).map(([name, check]) => [check, name]),
    );
}

/** A value of the configuration as source. */
function written(
    value: unknown,
    validatorNames: Map<unknown, string>,
    usedValidators: Set<string>,
    usedTheme: Set<string>,
): string {
    const recurse = (part: unknown) =>
        written(part, validatorNames, usedValidators, usedTheme);
    if (typeof value === "string") return JSON.stringify(value);
    if (isThemeGetter(value)) {
        const key = themeKey(value);
        usedTheme.add(key);
        return `fromTheme(${JSON.stringify(key)})`;
    }
    if (typeof value === "function") {
        const name = validatorNames.get(value);
        if (name === undefined) throw new Error("a validator with no name");
        usedValidators.add(name);
        return name;
    }
    if (Array.isArray(value)) return `[${value.map(recurse).join(", ")}]`;
    if (typeof value === "object" && value !== null) {
        return `{ ${Object.entries(value)
            .map(([key, part]) => `${JSON.stringify(key)}: ${recurse(part)}`)
            .join(", ")} }`;
    }
    throw new Error(`a value of no known kind: ${String(value)}`);
}

/** The source of src/foundation/merge-config.ts. */
export function mergeConfigSource(sources: readonly string[]): string {
    const config = fullConfig();
    const kept = keptGroups(groupsOf(words(sources), config), config);
    const validatorNames = names();
    const usedValidators = new Set<string>();
    const usedTheme = new Set<string>();
    const write = (value: unknown) =>
        written(value, validatorNames, usedValidators, usedTheme);
    const classGroups = Object.entries(config.classGroups)
        .filter(([group]) => kept.has(group))
        .map(
            ([group, definition]) =>
                `${JSON.stringify(group)}: ${write(definition)},`,
        );
    const only = (lists: Partial<Record<string, readonly string[]>>) =>
        Object.entries(lists)
            .filter(([group]) => kept.has(group))
            .map(
                ([group, list = []]) =>
                    [group, list.filter((g) => kept.has(g))] as const,
            )
            .filter(([, list]) => list.length > 0)
            .map(
                ([group, list]) =>
                    `${JSON.stringify(group)}: ${JSON.stringify(list)},`,
            );
    const theme: string[] = [];
    const done = new Set<string>();
    while ([...usedTheme].some((key) => !done.has(key))) {
        for (const key of [...usedTheme].sort()) {
            if (done.has(key)) continue;
            done.add(key);
            theme.push(
                `${JSON.stringify(key)}: ${write(config.theme[key] ?? [])},`,
            );
        }
    }
    return [
        "// Generated by tools/merge-config.ts (`pnpm run generate`). Do not edit.",
        'import { fromTheme, validators } from "tailwind-merge";',
        "",
        `const { ${[...usedValidators].sort().join(", ")} } = validators;`,
        "",
        "export function mergeConfig() {",
        "    return {",
        `        cacheSize: ${config.cacheSize},`,
        "        theme: {",
        ...theme.map((line) => `            ${line}`),
        "        },",
        "        classGroups: {",
        ...classGroups.map((line) => `            ${line}`),
        "        },",
        "        conflictingClassGroups: {",
        ...only(config.conflictingClassGroups).map(
            (line) => `            ${line}`,
        ),
        "        },",
        "        conflictingClassGroupModifiers: {",
        ...only(config.conflictingClassGroupModifiers).map(
            (line) => `            ${line}`,
        ),
        "        },",
        `        orderSensitiveModifiers: ${JSON.stringify(config.orderSensitiveModifiers)},`,
        "    };",
        "}",
        "",
    ].join("\n");
}
