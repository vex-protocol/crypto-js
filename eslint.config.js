import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["src/__tests__/**"] },
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
        },
    },
    eslintConfigPrettier,
);
