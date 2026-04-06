import {
  decode as decodeBase64,
  encode as encodeBase64,
} from "@stablelib/base64";
import { decode as encodeUTF8, encode as decodeUTF8 } from "@stablelib/utf8";

import type { IBaseMsg } from "@vex-chat/types";
import * as bip39 from "bip39";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { pbkdf2 as noblePbkdf2 } from "@noble/hashes/pbkdf2.js";
import ed2curve from "ed2curve";
import { Packr } from "msgpackr";
import nacl from "tweetnacl";

// node:fs is loaded dynamically so the module can be imported in browser/RN
// environments without failing at parse time. On Node the top-level await
// resolves synchronously; on other runtimes _fs stays undefined.
let _fs: { writeFileSync: typeof import("node:fs").writeFileSync; readFileSync: typeof import("node:fs").readFileSync } | undefined;
try {
  _fs = await import("node:fs");
} catch {
  // Not in a Node environment — saveKeyFile/loadKeyFile will throw at call time
}

// msgpackr with useRecords:false emits standard msgpack (no nonstandard record extension).
// moreTypes:false keeps the extension set to only what other decoders understand.
// pack() returns Node Buffer (tight view) so consumers like axios send the correct bytes.
const packer = new Packr({ useRecords: false, moreTypes: false });
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
export class XUtils {
  public static encodeUTF8 = encodeUTF8;

  public static decodeUTF8 = decodeUTF8;

  public static encodeBase64 = encodeBase64;

  public static decodeBase64 = decodeBase64;

  /**
   * Checks if two buffer-like objects are equal.
   *
   * @param buf1
   * @param buf2
   *
   * @returns True if equal, else false.
   */
  public static bytesEqual(
    buf1: Uint8Array | ArrayBuffer,
    buf2: Uint8Array | ArrayBuffer
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
        "Expected integer 0 < n < 281474976710655, received " + n,
      );
    }

    let str = n.toString(16);
    while (str.length < 12) {
      str = "0" + str;
    }
    return XUtils.decodeHex(str);
  }

  /**
   * Converts a Uint8Array representation of an integer back into a number.
   *
   * @param arr The array to convert.
   * @returns the number representation of arr.
   */
  public static uint8ArrToNumber(arr: Uint8Array) {
    let n = 0;
    for (let i = 0; i < arr.length; i++) {
      n = n * 256 + arr[i];
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
    msg: Uint8Array | Buffer,
  ): [Uint8Array, IBaseMsg] {
    const msgp = Uint8Array.from(msg);
    const msgh = msgp.slice(0, xConstants.HEADER_SIZE);
    const msgb = msgpackDecode(msgp.slice(xConstants.HEADER_SIZE)) as IBaseMsg;

    return [msgh, msgb];
  }

  /**
   * Packs a javascript object and a 32 byte header into a vex message.
   *
   * @param arr The array to convert.
   * @returns the packed message.
   */
  public static packMessage(msg: any, header?: Uint8Array) {
    const msgb = msgpackEncode(msg);
    const msgh = header || XUtils.emptyHeader();
    return xConcat(msgh, msgb);
  }

  /**
   * Returns the empty header (32 0's)
   *
   * @returns The empty header.
   */
  public static emptyHeader() {
    return new Uint8Array(xConstants.HEADER_SIZE);
  }

  /**
   * Encrypts a secret key with a password and saves it as a file.
   *
   * @param path The path to save the keyfile.
   * @param password The password to encrypt the keyfile with.
   * @param keyToSave The key to encrypt.
   * @param iterationOverride An optional override if you'd prefer to manually
   * select your iterations rather than having a random amount selected.
   */
  public static saveKeyFile = (
    path: string,
    password: string,
    keyToSave: string,
    iterationOverride?: number,
  ): void => {
    if (!_fs) throw new Error("saveKeyFile requires Node.js (node:fs)");

    const UNENCRYPTED_SIGNKEY = XUtils.decodeHex(keyToSave);

    const OFFSET = 1000;

    // generate random amount of iterations
    const rand = nacl.randomBytes(2);
    const N1 = rand[0];
    const N2 = rand[1];

    const iterations = iterationOverride ? iterationOverride : N1 * N2 + OFFSET;

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

    _fs.writeFileSync(path, result);
  };

  /**
   * Decrypts and returns a secret key stored in a file with saveKeyFile().
   *
   * @param path The path of the file.
   * @param password The password the file was encrypted with.
   */
  public static loadKeyFile = (path: string, password: string): string => {
    if (!_fs) throw new Error("loadKeyFile requires Node.js (node:fs)");

    const keyFile = Uint8Array.from(_fs.readFileSync(path));
    const ITERATIONS = XUtils.uint8ArrToNumber(keyFile.slice(0, 6));
    const PKBDF_SALT = keyFile.slice(6, 30);
    const ENCRYPTION_NONCE = keyFile.slice(30, 54);
    const ENCRYPTED_KEY = keyFile.slice(54);
    const DERIVED_KEY = noblePbkdf2(sha512, password, PKBDF_SALT, {
      c: ITERATIONS,
      dkLen: 32,
    });

    const DECRYPTED_SIGNKEY = nacl.secretbox.open(
      ENCRYPTED_KEY,
      ENCRYPTION_NONCE,
      DERIVED_KEY,
    );

    if (!DECRYPTED_SIGNKEY) {
      throw new Error("Decryption failed. Wrong password?");
    } else {
      return XUtils.encodeHex(DECRYPTED_SIGNKEY);
    }
  };

  /**
   * Decodes a hex string into a Uint8Array.
   *
   * @returns The Uint8Array.
   */
  public static decodeHex(hexString: string): Uint8Array {
    if (hexString.length === 0) {
      return new Uint8Array();
    }

    return new Uint8Array(
      hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );
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
}

/**
 * Gets a word list representation of a byte sequence.
 *
 * @param entropy The bytes to derive the wordlist from.
 * @param wordList Optional, override the wordlist. See bip39 docs for details.
 */
export function xMnemonic(
  entropy: Uint8Array,
  wordList?: string[] | undefined,
) {
  return bip39.entropyToMnemonic(XUtils.encodeHex(entropy), wordList);
}

/**
 * Returns a 32 byte HMAC of a javscript object.
 *
 * @param msg the message to create the HMAC of
 * @param SK the secret key to create the HMAC with
 */
export function xHMAC(msg: any, SK: Uint8Array) {
  const packedMsg = msgpackEncode(msg);
  return hmac(sha256, SK, packedMsg);
}

/**
 * Constants for vex.
 */
export const xConstants: XConstants = {
  CURVE: "X25519",
  HASH: "SHA-512",
  KEY_LENGTH: 32,
  INFO: "xchat",
  MIN_OTK_SUPPLY: 100,
  HEADER_SIZE: 32,
};

/**
 * Returns a 24 byte random nonce of cryptographic quality.
 */
export function xMakeNonce(): Uint8Array {
  return nacl.randomBytes(24);
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

export function xKDF(IKM: Uint8Array): Uint8Array {
  return hkdf(sha512, IKM, xMakeSalt(xConstants.CURVE), new TextEncoder().encode(xConstants.INFO), xConstants.KEY_LENGTH);
}

/**
 * Hashes some data.
 *
 * @param data the data to hash.
 * @returns The hash of the data.
 */
export function xHash(data: Uint8Array) {
  return XUtils.encodeHex(sha512(data));
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

/**
 * Concatanates multiple Uint8Arrays.
 *
 * @param arrays As many Uint8Arrays as you would like to concatanate.
 */
export function xConcat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

  if (!arrays.length) {
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
 * Encode an X25519 or X448 public key PK into a byte sequence.
 * The encoding consists of 0 or 1 to represent the type of curve, followed by l
 * ittle-endian encoding of the u-coordinate. See [rfc 7748](https://www.ietf.org/rfc/rfc7748.txt) for more
 * details.
 */
export function xEncode(
  curveType: "X25519" | "X448",
  publicKey: Uint8Array,
): Uint8Array {
  if (publicKey.length !== 32) {
    throw new Error(
      "Invalid key length, received key of length " +
        publicKey.length +
        " and expected length 32.",
    );
  }

  const bytes: number[] = [];

  switch (curveType) {
    case "X25519":
      bytes.push(0);
      break;
    case "X448":
      bytes.push(1);
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

/**
 * @ignore
 */
function keyLength(curve: "X25519" | "X448"): number {
  return curve === "X25519" ? 32 : 57;
}

/**
 * @ignore
 */
function xMakeSalt(curve: "X25519" | "X448"): Uint8Array {
  const saltLength = keyLength(curve);

  const salt = new Uint8Array(saltLength);
  for (let i = 0; i < saltLength; i++) {
    salt.set([0xff]);
  }

  return salt;
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
// tslint:disable-next-line: interface-name
interface XConstants {
  CURVE: "X25519";
  HASH: "SHA-512";
  INFO: string;
  KEY_LENGTH: 32 | 57;
  MIN_OTK_SUPPLY: number;
  HEADER_SIZE: 32;
}
