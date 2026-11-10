import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Rules that a type check cannot make: stale hook dependencies, floating
 * promises, and import order. Formatting is Prettier's, so
 * `eslint-config-prettier` switches off everything stylistic.
 */
export default tseslint.config(
    { ignores: ["dist"] },
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
    {
        files: ["eslint.config.js"],
        ...tseslint.configs.disableTypeChecked,
    },
    prettier,
);
