# @vex-chat/crypto

[![npm](https://img.shields.io/npm/v/@vex-chat/crypto?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@vex-chat/crypto)
[![CI](https://img.shields.io/github/actions/workflow/status/vex-protocol/crypto-js/build.yml?branch=master&style=flat-square&logo=github&label=CI)](https://github.com/vex-protocol/crypto-js/actions/workflows/build.yml)
[![Released](https://img.shields.io/github/release-date/vex-protocol/crypto-js?style=flat-square&label=released)](https://github.com/vex-protocol/crypto-js/releases)
[![License](https://img.shields.io/npm/l/@vex-chat/crypto?style=flat-square&color=blue)](./LICENSE)
[![Types](https://img.shields.io/npm/types/@vex-chat/crypto?style=flat-square&logo=typescript&color=3178c6)](./dist/index.d.ts)
[![Type Coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&label=type-coverage&prefix=%E2%89%A5&suffix=%25&query=$.typeCoverage.atLeast&url=https://raw.githubusercontent.com/vex-protocol/crypto-js/master/package.json&color=3178c6&logo=typescript)](https://github.com/plantain-00/type-coverage)
[![Node](https://img.shields.io/node/v/@vex-chat/crypto?style=flat-square&color=339933&logo=nodedotjs)](./package.json)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/vex-protocol/crypto-js?style=flat-square&label=Scorecard)](https://securityscorecards.dev/viewer/?uri=github.com/vex-protocol/crypto-js)
[![Socket](https://socket.dev/api/badge/npm/package/@vex-chat/crypto)](https://socket.dev/npm/package/@vex-chat/crypto)

Crypto primitives for the [Vex](https://vex.wtf) encrypted chat platform. Sign, encrypt, hash, derive keys, and encode bytes — everything the client and server need to speak the protocol.

## What's in the box

- **Key generation** — `xBoxKeyPair()` / `xSignKeyPair()` / `xSignKeyPairFromSecret()` / `xBoxKeyPairFromSecret()` for X25519 (box) and Ed25519 (sign) keypairs (`tweetnacl`).
- **Signing** — `xSign()` / `xSignOpen()` over arbitrary bytes (Ed25519, `tweetnacl`).
- **Authenticated encryption** — `xSecretbox()` / `xSecretboxOpen()` (XSalsa20-Poly1305 secretbox) and `xDH()` (X25519 scalar mult) via `tweetnacl`.
- **Hashing & KDF** — `xHash()` (SHA-512 hex via `@noble/hashes`), `xKDF()` (**HKDF-SHA-512** via `@noble/hashes`), `xHMAC()` (HMAC-SHA-256 via `@noble/hashes`), and `XUtils.encryptKeyData` / `decryptKeyData` (**PBKDF2-SHA-512** + `tweetnacl` secretbox).
- **Curve key encoding** — `xEncode()` prefixes a 32-byte X25519 public key for the wire format (not msgpack).
- **Msgpack framing** — `XUtils.packMessage()` / `unpackMessage()` wrap a 32-byte header + msgpack body (`msgpackr`); `unpackMessage` validates base fields with Zod.
- **Text & byte encoding** — `XUtils` hex/base64/UTF-8 helpers (`@stablelib/base64`, `@stablelib/utf8`).
- **Mnemonics** — `xMnemonic()` (BIP39 via `bip39`).
- **Utilities** — `xConcat()`, `xMakeNonce()`, `xRandomBytes()`, `XUtils.bytesEqual` (constant-time when lengths match), and `XKeyConvert` (Ed25519 ↔ X25519 via `ed2curve`).

**HKDF, PBKDF2, HMAC, and SHA-512 / SHA-256** all run through **`@noble/hashes`** — not Node’s built-in `crypto` module. **`tweetnacl`** supplies CSPRNG, box, sign, and secretbox. Unit tests may use Node `crypto` (e.g. `createHmac`) only as a cross-check against standard vectors.

## Install

```sh
npm install @vex-chat/crypto
```

`@vex-chat/types` is a peer dependency — install it alongside if you don't already have it:

```sh
npm install @vex-chat/types @vex-chat/crypto
```

## Usage

```ts
import {
    xBoxKeyPair,
    xSignKeyPair,
    xSign,
    xSignOpen,
    xSecretbox,
    xSecretboxOpen,
    xDH,
    xMakeNonce,
    XUtils,
} from "@vex-chat/crypto";

// Generate identity keys
const signKeys = xSignKeyPair();
const boxKeys = xBoxKeyPair();

// Sign a message (returns 64-byte signature prefix + message)
const message = XUtils.encodeUTF8("hello vex");
const signed = xSign(message, signKeys.secretKey);
const opened = xSignOpen(signed, signKeys.publicKey);

// Derive a shared secret and encrypt
const shared = xDH(boxKeys.secretKey, otherPartyPublicKey);
const nonce = xMakeNonce();
const ciphertext = xSecretbox(message, nonce, shared);

// Decrypt
const plaintext = xSecretboxOpen(ciphertext, nonce, shared);

// Msgpack wire body (32-byte header + msgpack); see XUtils.packMessage / unpackMessage
const wire = XUtils.packMessage({
    type: "success",
    transmissionID: "abc",
    data: null,
});
const [, body] = XUtils.unpackMessage(wire);
```

See the generated API docs at [vex-protocol.github.io/crypto-js](https://vex-protocol.github.io/crypto-js/) for the full surface.

## License

[AGPL-3.0-or-later](./LICENSE)
