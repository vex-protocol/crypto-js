# @vex-chat/crypto

[![npm](https://img.shields.io/npm/v/@vex-chat/crypto?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@vex-chat/crypto)
[![CI](https://img.shields.io/github/actions/workflow/status/vex-protocol/crypto-js/build.yml?branch=master&style=flat-square&logo=github&label=CI)](https://github.com/vex-protocol/crypto-js/actions/workflows/build.yml)
[![Released](https://img.shields.io/github/release-date/vex-protocol/crypto-js?style=flat-square&label=released)](https://github.com/vex-protocol/crypto-js/releases)
[![License](https://img.shields.io/npm/l/@vex-chat/crypto?style=flat-square&color=blue)](./LICENSE)
[![Types](https://img.shields.io/npm/types/@vex-chat/crypto?style=flat-square&logo=typescript&color=3178c6)](./dist/index.d.ts)
[![Type Coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&label=type-coverage&prefix=%E2%89%A5&suffix=%25&query=$.typeCoverage.atLeast&url=https://raw.githubusercontent.com/vex-protocol/crypto-js/master/package.json&color=3178c6&logo=typescript)](https://github.com/plantain-00/type-coverage)
[![Node](https://img.shields.io/node/v/@vex-chat/crypto?style=flat-square&color=339933&logo=nodedotjs)](./package.json)
[![Bundle](https://deno.bundlejs.com/badge?q=@vex-chat/crypto&treeshake=[*])](https://bundlejs.com/?q=@vex-chat/crypto&treeshake=[*])
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/vex-protocol/crypto-js?style=flat-square&label=Scorecard)](https://securityscorecards.dev/viewer/?uri=github.com/vex-protocol/crypto-js)
[![Socket](https://socket.dev/api/badge/npm/package/@vex-chat/crypto)](https://socket.dev/npm/package/@vex-chat/crypto)

Crypto primitives for the [Vex](https://vex.wtf) encrypted chat platform. Sign, encrypt, hash, derive keys, and encode bytes — everything the client and server need to speak the protocol.

## What's in the box

- **Key generation** — `xBoxKeyPair()` / `xSignKeyPair()` / `xSignKeyPairFromSecret()` / `xBoxKeyPairFromSecret()` for X25519 (encryption) and Ed25519 (signing) keypairs.
- **Signing** — `xSign()` / `xSignVerify()` over arbitrary bytes using Ed25519.
- **Authenticated encryption** — `xSecretbox()` / `xSecretboxOpen()` (NaCl secretbox) plus `xDH()` for Diffie-Hellman shared secrets.
- **Hashing & KDF** — `xHash()` (SHA-512), `xKDF()` (HKDF-SHA256 via `@noble/hashes`), `xHMAC()`, and PBKDF2.
- **Encoding** — `xEncode()` / `xDecode()` for msgpack wire serialization; `XUtils.encodeBase64` / `encodeUTF8` for constant-time transport encoding.
- **Mnemonic keys** — `xMnemonic()` (BIP39) for deriving keys from human-readable phrases.
- **Utilities** — `xConcat()`, `xMakeNonce()`, `xRandomBytes()`, and `XKeyConvert` (Ed25519 ↔ X25519 conversion via `ed2curve`).

All primitives use constant-time operations where relevant. Native Node crypto is used for HKDF/PBKDF2/HMAC/SHA; `tweetnacl` and `@noble/hashes` cover the rest.

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
    xSecretbox,
    xSecretboxOpen,
    xDH,
    xMakeNonce,
    xEncode,
    xDecode,
    XUtils,
} from "@vex-chat/crypto";

// Generate identity keys
const signKeys = xSignKeyPair();
const boxKeys = xBoxKeyPair();

// Sign a message
const message = XUtils.encodeUTF8("hello vex");
const signature = xSign(message, signKeys.secretKey);

// Derive a shared secret and encrypt
const shared = xDH(boxKeys.secretKey, otherPartyPublicKey);
const nonce = xMakeNonce();
const ciphertext = xSecretbox(message, nonce, shared);

// Decrypt
const plaintext = xSecretboxOpen(ciphertext, nonce, shared);

// msgpack wire encoding
const frame = xEncode({ type: "success", transmissionID: "abc", data: null });
const decoded = xDecode(frame);
```

See the generated API docs at [vex-chat.github.io/crypto-js](https://vex-chat.github.io/crypto-js/) for the full surface.

## License

[AGPL-3.0-or-later](./LICENSE)
