# @vex-chat/crypto

## 1.1.1

### Minor Changes

- 816a087: Platform-portable crypto: replace node:crypto with @noble/hashes for browser/RN compatibility.
    - Replaced createHash, createHmac, pbkdf2Sync, hkdfSync, randomBytes with @noble/hashes equivalents
    - Removed node:fs — saveKeyFile/loadKeyFile replaced by encryptKeyData/decryptKeyData (pure functions, no I/O)
    - Replaced Buffer.readUIntBE with pure-JS big-endian loop
    - Removed tslint config and inline directives
    - Removed auto-generated typedoc from git

## 1.1.0-rc.1

### Minor Changes

- 07caf93: Modernize package toolchain and shape; stop shipping cruft.

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

## 1.0.11-rc.11

### Patch Changes

- Declare `typescript >=5.9.0` as a peer dependency so consumers on the TypeScript 5.x line resolve it explicitly. No other source or dependency changes from 1.0.10-rc.8.

## 1.0.10-rc.8

### Patch Changes

- Publish-process iteration release. No material source or dependency changes from 1.0.6-rc.4 — this range of versions (rc.2 through rc.10, not all published) represents the release-tooling and CI-workflow stabilization that ultimately converged in 1.1.0-rc.1.

## 1.0.6-rc.4

### Patch Changes

- Publish-process iteration release. No material source or dependency changes from 1.0.3-rc.1.

## 1.0.3-rc.1

### Patch Changes

- 7294de7: Resolve `npm audit` findings from 1.0.0-rc.0. No public API changes.

## 1.0.0-rc.0

### Major Changes

- 19b36ca: Migrate to msgpackr and native node:crypto, replacing msgpack-lite, create-hmac, sha.js, pbkdf2, and futoin-hkdf with built-in Node.js crypto primitives. Add release tooling with changesets, mise, and updated CI workflows.
