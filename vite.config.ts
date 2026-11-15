import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Motion resolved to linen's stand-in, as an app without Motion has it. */
const STILL = [
    {
        find: /^motion(\/react)?$/,
        replacement: decodeURIComponent(
            new URL("src/still/still.tsx", import.meta.url).pathname,
        ),
    },
];

/** React resolved to Preact's compatibility layer, as a Preact app has it. */
const PREACT = [
    // Testing Library's package points Node at its CommonJS build, whose
    // require of react-dom no alias reaches; its module build imports it.
    // This goes once the package hands Vitest its module build.
    {
        find: /^@testing-library\/react$/,
        replacement:
            "@testing-library/react/dist/@testing-library/react.esm.js",
    },
    { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
    { find: /^react-dom\/test-utils$/, replacement: "preact/test-utils" },
    { find: /^react\/jsx-(dev-)?runtime$/, replacement: "preact/jsx-runtime" },
    { find: /^react(-dom)?$/, replacement: "preact/compat" },
    {
        find: /^use-sync-external-store\/shim(\/with-selector)?(\/index)?(\.js)?$/,
        replacement: decodeURIComponent(
            new URL("src/test/use-sync-external-store.ts", import.meta.url)
                .pathname,
        ),
    },
];

// The specimen draws the whole language with the components themselves; its
// build compiles every component through Tailwind as an app does.
// `--mode still` draws it without Motion, and `--mode preact` without Motion
// on Preact, whose preset resolves React to preact/compat.
export default defineConfig(({ mode }) => ({
    root: "specimen",
    // Each mode resolves React and Motion its own way, so each keeps its
    // own prebundled dependencies, and the three can be served at once.
    cacheDir: `../node_modules/.vite/${mode}`,
    plugins: [mode === "preact" ? preact() : react(), tailwindcss()],
    resolve: { alias: mode === "still" || mode === "preact" ? STILL : [] },
    // One page, loaded at once; nothing ships from it, so it builds apart from
    // the package's dist.
    build: {
        outDir: "dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1024,
    },
    test: {
        root: ".",
        environment: "jsdom",
        globals: true,
        setupFiles: ["src/test/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        // The stylesheet is read as text where a test holds it to the code.
        css: { include: [/src\/styles\/.+\.css/] },
        // Every component is tested with Motion and again without it.
        projects: [
            { extends: true, test: { name: "motion" } },
            {
                extends: true,
                resolve: { alias: STILL },
                test: {
                    name: "still",
                    setupFiles: ["src/test/still.ts"],
                    // Motion's own springs are what this test compares to,
                    // and the merge configuration has nothing to do with it.
                    exclude: [
                        "src/motion/springs.test.ts",
                        "src/foundation/merge-config.test.ts",
                    ],
                },
            },
            {
                extends: true,
                // Every dependency is compiled, from its module build, so each
                // one that imports React meets Preact.
                resolve: {
                    alias: [...STILL, ...PREACT],
                    conditions: ["module", "browser", "development", "import"],
                    noExternal: true,
                },
                test: {
                    name: "preact",
                    setupFiles: ["src/test/still.ts", "src/test/preact.ts"],
                    exclude: [
                        "src/motion/springs.test.ts",
                        "src/foundation/merge-config.test.ts",
                        // React Router needs hooks Preact does not have.
                        "src/navigation/react-router.test.tsx",
                    ],
                },
            },
        ],
    },
}));
