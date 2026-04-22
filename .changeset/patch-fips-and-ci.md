---
"@vex-chat/crypto": patch
---

- **FIPS configuration (`CryptoProfile`)** — The default profile is `tweetnacl` (Ed25519 / X25519 / XSalsa20-Poly1305 via tweetnacl). For FIPS-style environments (Web Crypto–backed primitives), call `setCryptoProfile("fips")` **once** at startup (e.g. after imports). In `fips` mode, synchronous NaCl-shaped entry points (`xSign`, `xDH`, `xSecretbox`, `xBoxKeyPair`, and related sync helpers) **throw** so call sites do not accidentally mix FIPS and legacy semantics. Use the `...Async` APIs instead: they route through the Web Crypto API (P-256 ECDSA, P-256 ECDH, AES-GCM, and `getRandomValues` for randomness). `getCryptoProfile()` reports the active profile. See README “Crypto profiles” for the full split between `tweetnacl` and `fips`.

- **CI** — All GitHub Actions checks run in a single job (one `npm ci` per push) so installs are not duplicated across parallel jobs.
