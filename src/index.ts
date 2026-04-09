import type { BaseMsg } from "@vex-chat/types";

import { baseMsg } from "@vex-chat/types";

import { hkdf } from "@noble/hashes/hkdf.js";
import { hmac } from "@noble/hashes/hmac.js";
import { pbkdf2 as noblePbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import {
    decode as decodeBase64,
    encode as encodeBase64,
} from "@stablelib/base64";
import { encode as decodeUTF8, decode as encodeUTF8 } from "@stablelib/utf8";
import * as bip39 from "bip39";
import ed2curve from "ed2curve";
import { Packr } from "msgpackr";
import nacl from "tweetnacl";

// msgpackr with useRecords:false emits standard msgpack (no nonstandard record extension).
// moreTypes:false keeps the extension set to only what other decoders understand.
// pack() returns Node Buffer (tight view) so consumers like axios send the correct bytes.
const packer = new Packr({ moreTypes: false, useRecords: false });
const msgpackEncode = packer.pack.bind(packer);
const msgpackDecode = packer.unpack.bind(packer);

/**
 * Provides an interface that can map an ed25519 keypair to its equivalent
 * X25519 keypair.
 */
export const XKeyConvert = ed2curve;

/**
 * Provides several methods that are useful in working with bytes and
 * vex messages.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- intentional static utility namespace (public API surface)
export class XUtils {
    public static decodeBase64 = decodeBase64;

    public static decodeUTF8 = decodeUTF8;

    public static encodeBase64 = encodeBase64;

    public static encodeUTF8 = encodeUTF8;

    /**
     * Checks if two buffer-like objects are equal.
     *
     * @param buf1
     * @param buf2
     *
     * @returns True if equal, else false.
     */
    public static bytesEqual(
        buf1: ArrayBuffer | Uint8Array,
        buf2: ArrayBuffer | Uint8Array,
    ) {
        const a = buf1 instanceof Uint8Array ? buf1 : new Uint8Array(buf1);
        const b = buf2 instanceof Uint8Array ? buf2 : new Uint8Array(buf2);
        if (a.byteLength !== b.byteLength) {
            return false;
        }
        for (let i = 0; i !== a.byteLength; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Decodes a hex string into a Uint8Array.
     *
     * @returns The Uint8Array.
     */
    public static decodeHex(hexString: string): Uint8Array {
        if (hexString.length === 0) {
            return new Uint8Array();
        }

        const matches = hexString.match(/.{1,2}/g) ?? [];
        return new Uint8Array(
            matches.map((byte) => parseInt(byte, 16)),
        );
    }

    /**
     * Decrypts a secret key from the binary format produced by encryptKeyData().
     * No I/O — the caller handles reading the data.
     *
     * @param keyData The encrypted key data as a Uint8Array.
     * @param password The password used to encrypt.
     * @returns The hex-encoded secret key.
     */
    public static decryptKeyData = (
        keyData: Uint8Array,
        password: string,
    ): string => {
        const ITERATIONS = XUtils.uint8ArrToNumber(keyData.slice(0, 6));
        const PKBDF_SALT = keyData.slice(6, 30);
        const ENCRYPTION_NONCE = keyData.slice(30, 54);
        const ENCRYPTED_KEY = keyData.slice(54);
        const DERIVED_KEY = noblePbkdf2(sha512, password, PKBDF_SALT, {
            c: ITERATIONS,
            dkLen: 32,
        });
        const DECRYPTED_SIGNKEY = nacl.secretbox.open(
            ENCRYPTED_KEY,
            ENCRYPTION_NONCE,
            DERIVED_KEY,
        );

        if (DECRYPTED_SIGNKEY === null) {
            throw new Error("Decryption failed. Wrong password?");
        }
        return XUtils.encodeHex(DECRYPTED_SIGNKEY);
    };

    /**
     * Returns the empty header (32 0's)
     *
     * @returns The empty header.
     */
    public static emptyHeader() {
        return new Uint8Array(xConstants.HEADER_SIZE);
    }

    /**
     * Encodes a Uint8Array to a hex string.
     *
     * @returns The hex string.
     */
    public static encodeHex(bytes: Uint8Array): string {
        return bytes.reduce(
            (str, byte) => str + byte.toString(16).padStart(2, "0"),
            "",
        );
    }

    /**
   * Encrypts a secret key with a password and saves it as a file.
   *
   * @param path The path to save the keyfile.
  /**
   * Encrypts a secret key into a portable binary format.
   * The result can be written to disk, sent over the network, etc.
   * No I/O — the caller handles persistence.
   *
   * Format: [iterations(6)|salt(24)|nonce(24)|ciphertext(N)]
   *
   * @param password The password to derive the encryption key from.
   * @param keyToSave The hex-encoded secret key to encrypt.
   * @param iterationOverride Optional PBKDF2 iteration count (random if omitted).
   * @returns The encrypted key data as a Uint8Array.
   */
    public static encryptKeyData = (
        password: string,
        keyToSave: string,
        iterationOverride?: number,
    ): Uint8Array => {
        const UNENCRYPTED_SIGNKEY = XUtils.decodeHex(keyToSave);
        const OFFSET = 1000;
        const rand = nacl.randomBytes(2);
        const [N1 = 0, N2 = 0] = rand;
        const iterations =
            iterationOverride !== undefined && iterationOverride !== 0
                ? iterationOverride
                : N1 * N2 + OFFSET;
        const ITERATIONS = XUtils.numberToUint8Arr(iterations);
        const PKBDF_SALT = xMakeNonce();
        const ENCRYPTION_KEY = noblePbkdf2(sha512, password, PKBDF_SALT, {
            c: iterations,
            dkLen: 32,
        });
        const NONCE = xMakeNonce();
        const ENCRYPTED_SIGNKEY = nacl.secretbox(
            UNENCRYPTED_SIGNKEY,
            NONCE,
            ENCRYPTION_KEY,
        );

        const result = new Uint8Array(
            ITERATIONS.length +
                PKBDF_SALT.length +
                NONCE.length +
                ENCRYPTED_SIGNKEY.length,
        );
        let offset = 0;
        result.set(ITERATIONS, offset);
        offset += ITERATIONS.length;
        result.set(PKBDF_SALT, offset);
        offset += PKBDF_SALT.length;
        result.set(NONCE, offset);
        offset += NONCE.length;
        result.set(ENCRYPTED_SIGNKEY, offset);
        return result;
    };

    /**
     * Returns a six bit Uint8Array representation of an integer.
     * The integer must be positive, and it must be able to be stored
     * in six bytes.
     *
     * @param n The number to convert.
     * @returns The Uint8Array representation of n.
     */
    public static numberToUint8Arr(n: number): Uint8Array {
        if (n < 0 || n > 281474976710655) {
            throw new Error(
                "Expected integer 0 < n < 281474976710655, received " + String(n),
            );
        }

        let str = n.toString(16);
        while (str.length < 12) {
            str = "0" + str;
        }
        return XUtils.decodeHex(str);
    }

    /**
     * Packs a javascript object and a 32 byte header into a vex message.
     *
     * @param arr The array to convert.
     * @returns the packed message.
     */
    public static packMessage(msg: unknown, header?: Uint8Array) {
        const msgb = msgpackEncode(msg);
        const msgh = header ?? XUtils.emptyHeader();
        return xConcat(msgh, msgb);
    }

    /**
     * Converts a Uint8Array representation of an integer back into a number.
     *
     * @param arr The array to convert.
     * @returns the number representation of arr.
     */
    public static uint8ArrToNumber(arr: Uint8Array) {
        let n = 0;
        for (const byte of arr) {
            n = n * 256 + byte;
        }
        return n;
    }

    /**
     * Takes a vex message and unpacks it into its header and a javascript object
     * respresentation of its body.
     *
     * @param arr The array to convert.
     * @returns [32 byte header, message body]
     */
    public static unpackMessage(
        msg: Buffer | Uint8Array,
    ): [Uint8Array, BaseMsg] {
        const msgp = Uint8Array.from(msg);
        const msgh = msgp.slice(0, xConstants.HEADER_SIZE);
        const msgb = baseMsg.passthrough().parse(
            msgpackDecode(msgp.slice(xConstants.HEADER_SIZE)),
        );

        return [msgh, msgb];
    }
}

/**
 * Returns a 32 byte HMAC of a javscript object.
 *
 * @param msg the message to create the HMAC of
 * @param SK the secret key to create the HMAC with
 */
export function xHMAC(msg: unknown, SK: Uint8Array) {
    const packedMsg = msgpackEncode(msg);
    return hmac(sha256, SK, packedMsg);
}

/**
 * Gets a word list representation of a byte sequence.
 *
 * @param entropy The bytes to derive the wordlist from.
 * @param wordList Optional, override the wordlist. See bip39 docs for details.
 */
export function xMnemonic(
    entropy: Uint8Array,
    wordList?: string[]  ,
) {
    return bip39.entropyToMnemonic(XUtils.encodeHex(entropy), wordList);
}

/**
 * Constants for vex.
 */
export const xConstants: XConstants = {
    CURVE: "X25519",
    HASH: "SHA-512",
    HEADER_SIZE: 32,
    INFO: "xchat",
    KEY_LENGTH: 32,
    MIN_OTK_SUPPLY: 100,
};

/** Ed25519 or X25519 key pair. Structurally identical to nacl.SignKeyPair / nacl.BoxKeyPair. */
export interface KeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}

/**
 * Derives a 32 byte secret key from some initial key material.
 *
 * @param IKM the initial key material.
 * @returns The generated key.
 */
// export function xKDF(IKM: Uint8Array): Uint8Array {
//     return Uint8Array.from(
//         hkdf(Buffer.from(IKM), xConstants.KEY_LENGTH, {
//             salt: Buffer.from(xMakeSalt(xConstants.CURVE)),
//             info: xConstants.INFO,
//             hash: xConstants.HASH,
//         })
//     );
// }

/**
 * @ignore
 */
interface XConstants {
    CURVE: "X25519";
    HASH: "SHA-512";
    HEADER_SIZE: 32;
    INFO: string;
    KEY_LENGTH: 32 | 57;
    MIN_OTK_SUPPLY: number;
}

/** Generate a fresh X25519 box key pair. */
export function xBoxKeyPair(): KeyPair {
    return nacl.box.keyPair();
}

/** Restore an X25519 box key pair from a 32-byte secret key. */
export function xBoxKeyPairFromSecret(secretKey: Uint8Array): KeyPair {
    return nacl.box.keyPair.fromSecretKey(secretKey);
}

/**
 * Concatanates multiple Uint8Arrays.
 *
 * @param arrays As many Uint8Arrays as you would like to concatanate.
 */
export function xConcat(...arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

    if (arrays.length === 0) {
        return new Uint8Array();
    }

    const result = new Uint8Array(totalLength);

    // for each array - copy it over result
    // next array is copied right after the previous one
    let length = 0;
    for (const array of arrays) {
        result.set(array, length);
        length += array.length;
    }

    return result;
}

/**
 * Derives a shared Secret Key from a known private key and
 * a peer's known public key.
 *
 * @param myPrivateKey Your own private key
 * @param theirPublicKey Their public key
 * @returns The derived shared secret, SK.
 */
export function xDH(
    myPrivateKey: Uint8Array,
    theirPublicKey: Uint8Array,
): Uint8Array {
    return nacl.box.before(theirPublicKey, myPrivateKey);
}

// ── Key pair type ───────────────────────────────────────────────────────────

/**
 * Encode an X25519 or X448 public key PK into a byte sequence.
 * The encoding consists of 0 or 1 to represent the type of curve, followed by l
 * ittle-endian encoding of the u-coordinate. See [rfc 7748](https://www.ietf.org/rfc/rfc7748.txt) for more
 * details.
 */
export function xEncode(
    curveType: "X448" | "X25519",
    publicKey: Uint8Array,
): Uint8Array {
    if (publicKey.length !== 32) {
        throw new Error(
            "Invalid key length, received key of length " +
                String(publicKey.length) +
                " and expected length 32.",
        );
    }

    const bytes: number[] = [];

    switch (curveType) {
        case "X448":
            bytes.push(1);
            break;
        case "X25519":
            bytes.push(0);
            break;
    }

    const key = BigInt("0x" + XUtils.encodeHex(publicKey));

    if (isEven(key)) {
        bytes.push(0);
    } else {
        bytes.push(1);
    }

    for (const byte of publicKey) {
        bytes.push(byte);
    }

    return Uint8Array.from(bytes);
}

// ── Key generation ─────────────────────────────────────────────────────────

/**
 * Hashes some data.
 *
 * @param data the data to hash.
 * @returns The hash of the data.
 */
export function xHash(data: Uint8Array) {
    return XUtils.encodeHex(sha512(data));
}

export function xKDF(IKM: Uint8Array): Uint8Array {
    return hkdf(
        sha512,
        IKM,
        xMakeSalt(xConstants.CURVE),
        new TextEncoder().encode(xConstants.INFO),
        xConstants.KEY_LENGTH,
    );
}

/**
 * Returns a 24 byte random nonce of cryptographic quality.
 */
export function xMakeNonce(): Uint8Array {
    return nacl.randomBytes(24);
}

/** Cryptographically secure random bytes. */
export function xRandomBytes(length: number): Uint8Array {
    return nacl.randomBytes(length);
}

// ── Signing ────────────────────────────────────────────────────────────────

/** Encrypt with a shared secret key. */
export function xSecretbox(plaintext: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array {
    return nacl.secretbox(plaintext, nonce, key);
}

/** Decrypt with a shared secret key. Returns null if authentication fails. */
export function xSecretboxOpen(ciphertext: Uint8Array, nonce: Uint8Array, key: Uint8Array): null | Uint8Array {
    return nacl.secretbox.open(ciphertext, nonce, key);
}

// ── Symmetric encryption (XSalsa20-Poly1305) ──────────────────────────────

/** Sign a message with an Ed25519 secret key. Returns signed message (64-byte signature prefix + message). */
export function xSign(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
    return nacl.sign(message, secretKey);
}

/** Generate a fresh Ed25519 signing key pair. */
export function xSignKeyPair(): KeyPair {
    return nacl.sign.keyPair();
}

// ── Random ─────────────────────────────────────────────────────────────────

/** Restore an Ed25519 signing key pair from a 64-byte secret key. */
export function xSignKeyPairFromSecret(secretKey: Uint8Array): KeyPair {
    return nacl.sign.keyPair.fromSecretKey(secretKey);
}

/** Verify and open a signed message. Returns the original message, or null if verification fails. */
export function xSignOpen(signedMessage: Uint8Array, publicKey: Uint8Array): null | Uint8Array {
    return nacl.sign.open(signedMessage, publicKey);
}

/**
 * @ignore
 */
function isEven(value: bigint) {
    if (value % BigInt(2) === BigInt(0)) {
        return true;
    } else {
        return false;
    }
}

/**
 * @ignore
 */
function keyLength(curve: "X448" | "X25519"): number {
    return curve === "X25519" ? 32 : 57;
}

/**
 * @ignore
 */
function xMakeSalt(curve: "X448" | "X25519"): Uint8Array {
    const salt = new Uint8Array(keyLength(curve));
    salt.fill(0xff);
    return salt;
}
