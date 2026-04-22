---
"@vex-chat/crypto": minor
---

Adds runtime crypto profile switching and async variants of all primitives for FIPS-compliant environments. Call `setCryptoProfile("fips")` to route `xRandomBytes`, `xSecretboxAsync`, `xSignAsync`, `xBoxKeyPairAsync`, `xDHAsync`, and the new `XUtils.encryptKeyDataAsync` / `decryptKeyDataAsync` through the Web Crypto API (`SubtleCrypto`) instead of tweetnacl. The default profile remains `"tweetnacl"` — existing call sites are unaffected.
