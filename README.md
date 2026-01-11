# @vex-chat/crypto-js

![typescript_ci](https://github.com/vex-chat/crypto-js/workflows/typescript_ci/badge.svg)

All of the crypto functions for the key exchange are contained in here.

[Documentation](https://vex-chat.github.io/crypto-js/)

## external crypto dependencies

This library utilizes native Node.js crypto where possible for performance and security.

-   **tweetnacl**: Primitives for signing and encryption (X25519 / Ed25519).
-   **ed2curve**: Ed25519 signing key to X25519 encryption key conversion.
-   **msgpackr**: High-performance MessagePack serialization (replacing `msgpack-lite`).
-   **bip39**: Mnemonic generation for keys.
-   **Node Crypto**: Native implementations for HKDF, PBKDF2, HMAC, and SHA hashing (replacing `futoin-hkdf`, `create-hmac`, and `sha.js`).
-   **@stablelib**: Constant-time encoding for Base64 and UTF8.
