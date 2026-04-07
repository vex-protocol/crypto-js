---
"@vex-chat/crypto": minor
---

Platform-portable crypto: replace node:crypto with @noble/hashes for browser/RN compatibility.

- Replaced createHash, createHmac, pbkdf2Sync, hkdfSync, randomBytes with @noble/hashes equivalents
- Removed node:fs — saveKeyFile/loadKeyFile replaced by encryptKeyData/decryptKeyData (pure functions, no I/O)
- Replaced Buffer.readUIntBE with pure-JS big-endian loop
- Removed tslint config and inline directives
- Removed auto-generated typedoc from git
