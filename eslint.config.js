import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * The modules of src/, each importing only from those after it (AGENTS.md).
 * The files at the root of src/ compose them, and `still` stands alone.
 */
const MODULES = [
    "layout",
    "navigation",
    "overlays",
    "fields",
    "controls",
    "motion",
    "foundation",
];

function moduleOrder() {
    const above = (at) => [...MODULES.slice(0, at), "still"];
    const rule = (forbidden) => [
        "error",
        {
            patterns: [
                {
                    regex: `^(\\.\\./)+(${forbidden.join("|")})(/|$)`,
                    message: "A module imports only from the modules after it.",
                },
                {
                    regex: "^(\\.\\./)+(index|LinenProvider|theme)$",
                    message: "The root of src/ composes the modules.",
                },
            ],
        },
    ];
    return [
        ...MODULES.slice(0, -1).map((name, at) => ({
            files: [`src/${name}/**/*.{ts,tsx}`],
            ignores: ["**/*.test.{ts,tsx}"],
            rules: { "no-restricted-imports": rule(above(at)) },
        })),
        {
            files: ["src/foundation/**/*.{ts,tsx}", "src/still/**/*.{ts,tsx}"],
            ignores: ["**/*.test.{ts,tsx}"],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        patterns: [
                            {
                                regex: "^\\.\\./",
                                message:
                                    "foundation and still import nothing else from linen.",
                            },
                        ],
                    },
                ],
            },
        },
    ];
}

/**
 * Rules that a type check cannot make: stale hook dependencies, floating
 * promises, import order and the order modules depend in. Formatting is
 * Prettier's, so `eslint-config-prettier` switches off everything stylistic.
 */
export default tseslint.config(
    {
        ignores: [
            "dist",
            "specimen/dist",
            "consumer/dist",
            "src/foundation/merge-config.ts",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                { allowNumber: true },
            ],
        },
    },
    ...moduleOrder(),
    {
        files: ["eslint.config.js"],
        ...tseslint.configs.disableTypeChecked,
    },
    prettier,
);
