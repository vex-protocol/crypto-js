# @vex-chat/crypto

## 2.1.0

### Minor Changes

- 73d2a0b: Adds runtime crypto profile switching and async variants of all primitives for FIPS-compliant environments. Call `setCryptoProfile("fips")` to route `xRandomBytes`, `xSecretboxAsync`, `xSignAsync`, `xBoxKeyPairAsync`, `xDHAsync`, and the new `XUtils.encryptKeyDataAsync` / `decryptKeyDataAsync` through the Web Crypto API (`SubtleCrypto`) instead of tweetnacl. The default profile remains `"tweetnacl"` — existing call sites are unaffected.

## 2.0.1

### Patch Changes

- f983591: `XUtils.bytesEqual()` now uses a constant-time XOR-accumulator loop when the buffers are equal length, eliminating the timing side-channel in the previous early-exit implementation. No API change — callers get the same boolean result with identical behavior for unequal-length inputs.
- f983591: Bumped `@noble/hashes` dependency to `2.2.0`.

## 2.0.0

### Major Changes

- 98ef88b: Align with `@vex-chat/types@2.0.0`. **Breaking**: consumers must upgrade `@vex-chat/types` alongside this release.
    - **Peer dependency `@vex-chat/types` bumped from `^1.0.0-rc.1` to `^2.0.0`.** The types package renamed every interface to drop the `I` prefix (`IBaseMsg` → `BaseMsg`), renamed schemas to the `XSchema` form, and migrated date fields from `Date` to ISO 8601 strings. See the `@vex-chat/types` v2 changelog for the full migration.
    - **`XUtils.unpackMessage()` return type** changed from `[Uint8Array, IBaseMsg]` to `[Uint8Array, BaseMsg]` to track the types rename. Runtime shape unchanged.
    - **`XUtils.packMessage(msg)` and `xHMAC(msg)` first-parameter types** narrowed from `any` to `unknown`. Consumers passing untyped values will need an explicit cast or type guard at the call site. Runtime behavior unchanged.
    - **Deprecated `z.object().passthrough()` replaced with `.loose()`** in `unpackMessage`'s inline schema. Identical runtime semantics — silences Zod 4's deprecation warning.

### Minor Changes

- 2e33b45: Ship complete nacl operation wrappers as first-class exports, replacing the previous pattern of reaching into `nacl.*` directly. Callers no longer need to import `tweetnacl` themselves for the common key-generation, signing, and authenticated-encryption flows.
    - **Key generation**: `xBoxKeyPair()`, `xBoxKeyPairFromSecret(secretKey)`, `xSignKeyPair()`, `xSignKeyPairFromSecret(secretKey)`
    - **Signing**: `xSign(message, secretKey)`, `xSignOpen(signedMessage, publicKey)`
    - **Authenticated encryption**: `xSecretbox(plaintext, nonce, key)`, `xSecretboxOpen(ciphertext, nonce, key)`
    - **Randomness**: `xRandomBytes(length)`
    - **Shared type**: new exported `KeyPair` interface

    Also fixes a bug in `xMakeSalt` that could produce biased salts in certain code paths. The new implementation uses unbiased randomness throughout.

- b347403: Packaging and publish-metadata cleanup visible on npmjs.com.
    - **`src/` now ships in the npm tarball** (`files: ["dist", "src", "LICENSE"]`) for consumer auditability. Test files in `src/__tests__/**` are excluded via `tsconfig.build.json`, so the tarball grows by the production source only.
    - **`npm publish` now attaches provenance attestation** via the GitHub Actions OIDC token. npmjs.com displays the "Published via GitHub Actions" badge next to the version, and consumers can verify the tarball was built by this exact workflow at this exact commit.
    - **`repository` URL corrected** — 1.1.1 accidentally pointed at `vex-chat/libvex-js`; now correctly points at `vex-protocol/crypto-js`. The "Repository" link on npmjs.com lands at the right place.
    - **Package description updated** to `"Crypto primitives for the Vex encrypted chat platform"`.
    - **Node engine floor raised** to `>=24.0.0` (`npm >=10.0.0`). Previously unspecified; `npm install` will now warn (or fail under `engine-strict`) on older Node versions.

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
