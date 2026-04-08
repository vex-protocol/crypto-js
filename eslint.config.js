import vitest from "@vitest/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
    ...tseslint.configs.strictTypeChecked,
    perfectionist.configs["recommended-natural"],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unsafe-type-assertion": "error",
            "@typescript-eslint/strict-boolean-expressions": [
                "error",
                {
                    allowString: false,
                    allowNumber: false,
                    allowNullableObject: false,
                },
            ],
            "@typescript-eslint/switch-exhaustiveness-check": "error",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/no-import-type-side-effects": "error",
            "@typescript-eslint/prefer-readonly": "error",
            "@typescript-eslint/require-array-sort-compare": "error",

            "perfectionist/sort-imports": [
                "error",
                {
                    type: "natural",
                    order: "asc",
                    ignoreCase: true,
                    internalPattern: ["^@vex-chat/"],
                    newlinesBetween: 1,
                    customGroups: [
                        {
                            groupName: "type-imports",
                            modifiers: ["type"],
                        },
                    ],
                    groups: [
                        "type-imports",
                        "builtin",
                        "internal",
                        "external",
                        "parent",
                        "sibling",
                        "index",
                        "unknown",
                    ],
                },
            ],
        },
    },
    {
        files: ["src/__tests__/**/*.ts"],
        plugins: { vitest },
        rules: {
            ...vitest.configs.recommended.rules,
            // Relax strict rules for tests
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "vitest/no-conditional-expect": "warn",
        },
    },
    eslintConfigPrettier,
);
