import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Motion resolved to linen's stand-in, as an app without Motion has it. */
const STILL = [
    {
        find: /^motion(\/react)?$/,
        replacement: decodeURIComponent(
            new URL("src/still.tsx", import.meta.url).pathname,
        ),
    },
];

// The specimen draws the whole language with the components themselves; its
// build compiles every component through Tailwind as an app does.
// `--mode still` draws it without Motion.
export default defineConfig(({ mode }) => ({
    root: "specimen",
    plugins: [react(), tailwindcss()],
    resolve: { alias: mode === "still" ? STILL : [] },
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
                    // Motion's own springs are what this test compares to.
                    exclude: ["src/motion.test.ts"],
                },
            },
        ],
    },
}));
