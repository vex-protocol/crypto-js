---
"@vex-chat/crypto": major
---

Align with `@vex-chat/types@2.0.0`. **Breaking**: consumers must upgrade `@vex-chat/types` alongside this release.

- **Peer dependency `@vex-chat/types` bumped from `^1.0.0-rc.1` to `^2.0.0`.** The types package renamed every interface to drop the `I` prefix (`IBaseMsg` → `BaseMsg`), renamed schemas to the `XSchema` form, and migrated date fields from `Date` to ISO 8601 strings. See the `@vex-chat/types` v2 changelog for the full migration.
- **`XUtils.unpackMessage()` return type** changed from `[Uint8Array, IBaseMsg]` to `[Uint8Array, BaseMsg]` to track the types rename. Runtime shape unchanged.
- **`XUtils.packMessage(msg)` and `xHMAC(msg)` first-parameter types** narrowed from `any` to `unknown`. Consumers passing untyped values will need an explicit cast or type guard at the call site. Runtime behavior unchanged.
- **Deprecated `z.object().passthrough()` replaced with `.loose()`** in `unpackMessage`'s inline schema. Identical runtime semantics — silences Zod 4's deprecation warning.
