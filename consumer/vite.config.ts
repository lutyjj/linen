import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { budget } from "../tools/budget.ts";
import budgets from "./budget.json" with { type: "json" };

const dist = (path: string) =>
    decodeURIComponent(new URL(`../dist/${path}`, import.meta.url).pathname);

/**
 * An app as a lean consumer builds it: linen from its packed build, on
 * Preact, with Motion resolved to linen/still, held to the budgets in
 * budget.json. Each page builds alone, as an app ships it: `--mode minimal`
 * is a button in the provider, `--mode app` a shell with a screen of the
 * parts most apps use.
 */
export default defineConfig(({ mode }) => ({
    root: decodeURIComponent(new URL(".", import.meta.url).pathname),
    logLevel: "warn",
    plugins: [preact(), tailwindcss(), budget({ dist: dist(""), budgets })],
    resolve: {
        alias: [
            { find: /^motion(\/react)?$/, replacement: dist("still.js") },
            { find: /^linen\/still$/, replacement: dist("still.js") },
            {
                find: /^linen\/linen\.css$/,
                replacement: dist("styles/linen.css"),
            },
            { find: /^linen$/, replacement: dist("index.js") },
        ],
    },
    build: {
        outDir: `dist/${mode}`,
        emptyOutDir: true,
        rolldownOptions: { input: { [mode]: `${mode}.html` } },
    },
}));
