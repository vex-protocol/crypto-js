---
"@vex-chat/crypto": minor
---

Ship complete nacl operation wrappers as first-class exports, replacing the previous pattern of reaching into `nacl.*` directly. Callers no longer need to import `tweetnacl` themselves for the common key-generation, signing, and authenticated-encryption flows.

- **Key generation**: `xBoxKeyPair()`, `xBoxKeyPairFromSecret(secretKey)`, `xSignKeyPair()`, `xSignKeyPairFromSecret(secretKey)`
- **Signing**: `xSign(message, secretKey)`, `xSignOpen(signedMessage, publicKey)`
- **Authenticated encryption**: `xSecretbox(plaintext, nonce, key)`, `xSecretboxOpen(ciphertext, nonce, key)`
- **Randomness**: `xRandomBytes(length)`
- **Shared type**: new exported `KeyPair` interface

Also fixes a bug in `xMakeSalt` that could produce biased salts in certain code paths. The new implementation uses unbiased randomness throughout.
