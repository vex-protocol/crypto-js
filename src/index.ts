import { KeyRingUtils } from "@extrahash/keyring";
import { XTypes } from "@vex-chat/types";
import * as bip39 from "bip39";
import createHmac from "create-hmac";
import ed2curve from "ed2curve";
import fs from "fs";
import hkdf from "futoin-hkdf";
import msgpack from "msgpack-lite";
import { pbkdf2Sync } from "pbkdf2";
import nacl from "tweetnacl";

export const XKeyConvert = ed2curve;

export class XUtils extends KeyRingUtils {
    public static bytesEqual(buf1: ArrayBufferLike, buf2: ArrayBufferLike) {
        if (buf1.byteLength !== buf2.byteLength) {
            return false;
        }
        const dv1 = new Int8Array(buf1);
        const dv2 = new Int8Array(buf2);
        for (let i = 0; i !== buf1.byteLength; i++) {
            if (dv1[i] !== dv2[i]) {
                return false;
            }
        }
        return true;
    }

    public static numberToUint8Arr(n: number): Uint8Array {
        let str = n.toString(16);
        while (str.length < 12) {
            str = "0" + str;
        }
        return XUtils.decodeHex(str);
    }

    public static uint8ArrToNumber(arr: Uint8Array) {
        return Buffer.from(arr).readUIntBE(0, arr.length);
    }

    public static unpackMessage(msg: Buffer): [Uint8Array, XTypes.WS.IBaseMsg] {
        const msgp = Uint8Array.from(msg);
        const msgh = msgp.slice(0, xConstants.HEADER_SIZE);
        const msgb = msgpack.decode(msgp.slice(xConstants.HEADER_SIZE));

        return [msgh, msgb];
    }

    public static packMessage(msg: any, header?: Uint8Array) {
        const msgb = Uint8Array.from(msgpack.encode(msg));
        const msgh = header || XUtils.emptyHeader();
        return xConcat(msgh, msgb);
    }

    public static emptyHeader() {
        return new Uint8Array(xConstants.HEADER_SIZE);
    }

    public static saveKeyFile = (
        path: string,
        password: string,
        keyToSave: string
    ): void => {
        const UNENCRYPTED_SIGNKEY = XUtils.decodeHex(keyToSave);

        // generate random amount of iterations
        const R1 = nacl.randomBytes(1);
        const R2 = nacl.randomBytes(1);
        const N1 = XUtils.uint8ArrToNumber(R1);
        const N2 = XUtils.uint8ArrToNumber(R2);
        const iterations = N1 * N2;

        // length 6
        const ITERATIONS = XUtils.numberToUint8Arr(iterations);

        // length 24
        const PKBDF_SALT = xMakeNonce();

        // derived key to encrypt our signkeys with
        const ENCRYPTION_KEY = Uint8Array.from(
            pbkdf2Sync(password, PKBDF_SALT, iterations, 32)
        );
        const NONCE = xMakeNonce();

        const ENCRYPTED_SIGNKEY = nacl.secretbox(
            UNENCRYPTED_SIGNKEY,
            NONCE,
            ENCRYPTION_KEY
        );
        fs.writeFileSync(
            path,
            xConcat(ITERATIONS, PKBDF_SALT, NONCE, ENCRYPTED_SIGNKEY)
        );
    };

    public static loadKeyFile = (path: string, password: string): string => {
        const keyFile = Uint8Array.from(fs.readFileSync(path));
        const ITERATIONS = XUtils.uint8ArrToNumber(keyFile.slice(0, 6));
        const PKBDF_SALT = keyFile.slice(6, 30);
        const ENCRYPTION_NONCE = keyFile.slice(30, 54);
        // this is the id key we need to decrypt
        const ENCRYPTED_KEY = keyFile.slice(54);
        // the derived key from the user's password
        const DERIVED_KEY = Uint8Array.from(
            pbkdf2Sync(password, PKBDF_SALT, ITERATIONS, 32)
        );

        const DECRYPTED_SIGNKEY = nacl.secretbox.open(
            ENCRYPTED_KEY,
            ENCRYPTION_NONCE,
            DERIVED_KEY
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
    public static decodeHex(hexString: string, length?: number): Uint8Array {
        if (hexString.length === 0) {
            return new Uint8Array();
        }

        return new Uint8Array(
            hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
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
            ""
        );
    }
}

export function xMnemonic(
    entropy: Uint8Array,
    wordList?: string[] | undefined
) {
    return bip39.entropyToMnemonic(Buffer.from(entropy), wordList);
}

export function xHMAC(msg: any, SK: Uint8Array) {
    const packedMsg = Uint8Array.from(msgpack.encode(msg));
    const hmacGen = createHmac("sha256", Buffer.from(SK));
    hmacGen.update(packedMsg);
    const hmac = Uint8Array.from(hmacGen.digest());
    return hmac;
}

export const xConstants: XConstants = {
    CURVE: "X25519",
    HASH: "SHA-512",
    KEY_LENGTH: 32,
    INFO: "xchat",
    MIN_OTK_SUPPLY: 100,
    HEADER_SIZE: 32,
};

export function xMakeNonce(): Uint8Array {
    return nacl.randomBytes(24);
}

export function xKDF(IKM: Uint8Array): Uint8Array {
    return Uint8Array.from(
        hkdf(Buffer.from(IKM), xConstants.KEY_LENGTH, {
            salt: Buffer.from(xMakeSalt(xConstants.CURVE)),
            info: xConstants.INFO,
            hash: xConstants.HASH,
        })
    );
}

export function xDH(
    myPrivateKey: Uint8Array,
    theirPublicKey: Uint8Array
): Uint8Array {
    return nacl.box.before(theirPublicKey, myPrivateKey);
}

export function xConcat(...arrays: Uint8Array[]): Uint8Array {
    // sum of individual array lengths
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

export function xEncode(
    curveType: "X25519" | "X448",
    publicKey: Uint8Array
): Uint8Array {
    if (publicKey.length !== 32) {
        throw new Error(
            "Invalid key length, received key of length " +
                publicKey.length +
                " and expected length 32."
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

function keyLength(curve: "X25519" | "X448"): number {
    return curve === "X25519" ? 32 : 57;
}

function xMakeSalt(curve: "X25519" | "X448"): Uint8Array {
    const saltLength = keyLength(curve);

    const salt = new Uint8Array(saltLength);
    for (let i = 0; i < saltLength; i++) {
        salt.set([0xff]);
    }

    return salt;
}

function isEven(value: bigint) {
    if (value % BigInt(2) === BigInt(0)) {
        return true;
    } else {
        return false;
    }
}

// tslint:disable-next-line: interface-name
interface XConstants {
    CURVE: "X25519";
    HASH: "SHA-512";
    INFO: string;
    KEY_LENGTH: 32 | 57;
    MIN_OTK_SUPPLY: number;
    HEADER_SIZE: 32;
}
