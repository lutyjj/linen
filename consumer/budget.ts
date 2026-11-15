import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import type { Plugin } from "vite";

/** Gzipped bytes each page may weigh, by the name of its entry. */
export type Budgets = Record<string, { js: number; css: number }>;

const MOTION_IMPORT = /["']motion(\/[a-z-]+)?["']/;

/**
 * Holds a consumer's build to account: no declaration linen ships names
 * Motion, and no page, with every chunk it loads and the stylesheet it
 * wears, outweighs its budget gzipped as one file.
 */
export function budget({
    dist,
    budgets,
}: {
    dist: string;
    budgets: Budgets;
}): Plugin {
    return {
        name: "linen:budget",
        apply: "build",
        buildStart() {
            const named = readdirSync(dist, {
                recursive: true,
                encoding: "utf8",
            })
                .filter((path) => path.endsWith(".d.ts"))
                .filter((path) =>
                    MOTION_IMPORT.test(readFileSync(join(dist, path), "utf8")),
                );
            if (named.length > 0) {
                this.error(
                    `declarations that name Motion: ${named.join(", ")}`,
                );
            }
        },
        generateBundle(_, bundle) {
            // A page's files gzipped as one, as an app that ships the page
            // in one file has them.
            const gzipped = (names: Iterable<string>) =>
                gzipSync(
                    [...names]
                        .map((name) => {
                            const file = bundle[name];
                            if (file === undefined) return "";
                            return file.type === "chunk"
                                ? file.code
                                : String(file.source);
                        })
                        .join("\n"),
                    { level: 9 },
                ).length;
            const over: string[] = [];
            for (const chunk of Object.values(bundle)) {
                if (chunk.type !== "chunk" || !chunk.isEntry) continue;
                const page = chunk.name;
                const scripts = new Set<string>();
                const styles = new Set<string>();
                const visit = (name: string) => {
                    const file = bundle[name];
                    if (file?.type !== "chunk" || scripts.has(name)) return;
                    scripts.add(name);
                    for (const css of file.viteMetadata?.importedCss ?? []) {
                        styles.add(css);
                    }
                    // Code a page loads later still ships with it.
                    for (const next of [
                        ...file.imports,
                        ...file.dynamicImports,
                    ]) {
                        visit(next);
                    }
                };
                visit(chunk.fileName);
                const js = gzipped(scripts);
                const css = gzipped(styles);
                const allowed = budgets[page];
                console.log(
                    `${page}: ${js} B of JavaScript, ${css} B of CSS, gzipped` +
                        (allowed === undefined
                            ? ""
                            : ` (budget ${allowed.js} B and ${allowed.css} B)`),
                );
                if (allowed === undefined) {
                    over.push(`${page} has no budget`);
                    continue;
                }
                if (js > allowed.js)
                    over.push(
                        `${page}'s JavaScript is ${js - allowed.js} B over`,
                    );
                if (css > allowed.css)
                    over.push(`${page}'s CSS is ${css - allowed.css} B over`);
            }
            if (over.length > 0) this.error(over.join("; "));
        },
    };
}
