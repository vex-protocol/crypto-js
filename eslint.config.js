import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    ...tseslint.configs.strictTypeChecked,
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
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-import-type-side-effects": "error",
            "@typescript-eslint/prefer-readonly": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
        },
    },
    eslintConfigPrettier,
);
