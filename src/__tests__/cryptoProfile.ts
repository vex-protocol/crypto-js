/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 */

import {
    getCryptoProfile,
    setCryptoProfile,
    xDH,
    xMakeNonce,
    xRandomBytes,
    XUtils,
} from "../index.js";

afterEach(() => {
    setCryptoProfile("tweetnacl");
});

test("crypto profile defaults to tweetnacl", () => {
    expect(getCryptoProfile()).toBe("tweetnacl");
});

test("fips profile rejects nacl-coupled operations", () => {
    setCryptoProfile("fips");

    const myPrivateKey = XUtils.decodeHex(
        "918ed243e2c6c507168b20e8b167cff33a10c30e99e8defe28dc2147f5cce703",
    );
    const theirPublicKey = XUtils.decodeHex(
        "6f4cc1ffc4009bd4f94628ba5922e40afa3491f0daa43ec9da0f7dc39bb1c026",
    );

    expect(() => xDH(myPrivateKey, theirPublicKey)).toThrow(
        'Crypto profile "fips" does not implement xDH yet.',
    );
});

test("fips profile still supports random bytes", () => {
    setCryptoProfile("fips");

    const bytes = xRandomBytes(32);
    const nonce = xMakeNonce();

    expect(bytes.length).toBe(32);
    expect(nonce.length).toBe(24);
});

test("switching back to tweetnacl restores behavior", () => {
    const myPrivateKey = XUtils.decodeHex(
        "918ed243e2c6c507168b20e8b167cff33a10c30e99e8defe28dc2147f5cce703",
    );
    const theirPublicKey = XUtils.decodeHex(
        "6f4cc1ffc4009bd4f94628ba5922e40afa3491f0daa43ec9da0f7dc39bb1c026",
    );
    const correctDerivedKey =
        "19a8594bdcf875ec9d4b8b9615ea8b73a0b327bb64b8f727dd2dee3a603a2230";

    setCryptoProfile("fips");
    setCryptoProfile("tweetnacl");

    const derived = XUtils.encodeHex(xDH(myPrivateKey, theirPublicKey));
    expect(derived).toBe(correctDerivedKey);
});
