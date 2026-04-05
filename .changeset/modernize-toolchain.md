---
"@vex-chat/crypto": minor
---

Modernize package toolchain and shape; stop shipping cruft.

**Breaking**: `@vex-chat/types` moved from `dependencies` to `peerDependencies`. Consumers (which all already declare types directly) continue to work unchanged. This eliminates duplicate copies of types in consumer node_modules.

**Breaking**: package published as pure ESM (`"type": "module"` with `"exports"` conditions). CJS consumers must use dynamic `import()`.

**Bug fix (published tarball)**: Added `"files": ["dist"]` — earlier versions were shipping the entire `.yalc/` directory, `yalc.lock`, `vitest.config.ts`, `mise.toml`, `RELEASING.md`, etc. in the npm tarball, including a baked-in snapshot of `@vex-chat/types`. Package size reduced from 104 kB → 54 kB unpacked.

**Non-breaking**:

- `"sideEffects": false` added for tree-shaking
- Upgraded to `@stablelib/base64` ^2.0.1, `@stablelib/utf8` ^2.1.0
- Removed unused `uuid` dependency
- Replaced `lodash` test-dep with Vitest's built-in `toEqual`

**Internal**:

- Pinned Node 24.14.0 via mise; migrated yarn → npm
- TypeScript 5.9 → 6.0.2, `@types/node` → 24.12.2
- `verbatimModuleSyntax: true` in tsconfig
- Migrated test runner from Jest + ts-jest to Vitest (3x faster)
- GitHub Actions workflow migrated to npm
