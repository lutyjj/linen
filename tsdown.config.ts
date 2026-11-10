import { defineConfig } from "tsdown";

/**
 * The package a release attaches: the components as ESM with their
 * declarations, and the stylesheets beside them, whose `@source "../"` then
 * names the built components to the app's Tailwind. tsdown writes
 * package.json's exports: the source for a checkout an app uses as a
 * workspace package, and `publishConfig` for the packed package, which
 * publint and attw check.
 */
export default defineConfig({
    entry: ["src/index.ts"],
    platform: "neutral",
    dts: true,
    copy: { from: "src/styles/*.css", to: "dist/styles" },
    exports: {
        devExports: true,
        customExports: (exports, { isPublish }) => ({
            ...exports,
            "./linen.css": isPublish
                ? "./dist/styles/linen.css"
                : "./src/styles/linen.css",
        }),
    },
    publint: { level: "warning", strict: true },
    // A stylesheet has no types to resolve.
    attw: {
        profile: "esm-only",
        level: "error",
        excludeEntrypoints: [/\.css$/],
    },
});
