import { defineConfig } from "vitest/config";

const asyncTestFiles = [
    "src/__tests__/xAsyncProfile.ts",
    "src/__tests__/xAsyncApi.extended.test.ts",
];

/**
 * Two projects so CI can run "core" vs "async API (tweetnacl + FIPS)" as separate
 * steps with no duplicate work. `vitest run` (default `npm test`) still executes both.
 */
export default defineConfig({
    test: {
        globals: true,
        projects: [
            {
                extends: true,
                test: {
                    name: "core",
                    include: ["src/__tests__/**/*.ts"],
                    exclude: asyncTestFiles,
                },
            },
            {
                extends: true,
                test: {
                    name: "async-api",
                    include: asyncTestFiles,
                },
            },
        ],
    },
});
