import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The specimen draws the whole language with the components themselves; its
// build compiles every component through Tailwind as an app does.
export default defineConfig({
    root: "specimen",
    plugins: [react(), tailwindcss()],
    // One page, loaded at once; nothing ships from it.
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1024,
    },
    test: {
        root: ".",
        environment: "jsdom",
        globals: true,
        setupFiles: ["src/test/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
