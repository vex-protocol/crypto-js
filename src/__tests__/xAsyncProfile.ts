/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 */

import {
    setCryptoProfile,
    xBoxKeyPairAsync,
    xDHAsync,
    xSecretboxAsync,
    xSecretboxOpenAsync,
    xSignAsync,
    xSignKeyPairAsync,
    xSignOpenAsync,
    XUtils,
} from "../index.js";

afterEach(() => {
    setCryptoProfile("tweetnacl");
});

test("tweetnacl async wrappers preserve sign/open semantics", async () => {
    setCryptoProfile("tweetnacl");
    const keys = await xSignKeyPairAsync();
    const message = XUtils.decodeUTF8("hello async");
    const signed = await xSignAsync(message, keys.secretKey);
    const opened = await xSignOpenAsync(signed, keys.publicKey);

    if (opened === null) {
        throw new Error("Expected signed message to verify in tweetnacl mode.");
    }
    expect(XUtils.encodeUTF8(opened)).toBe("hello async");
});

test("fips async sign/open roundtrip", async () => {
    setCryptoProfile("fips");
    const keys = await xSignKeyPairAsync();
    const message = XUtils.decodeUTF8("hello fips");
    const signed = await xSignAsync(message, keys.secretKey);
    const opened = await xSignOpenAsync(signed, keys.publicKey);

    if (opened === null) {
        throw new Error("Expected signed message to verify in fips mode.");
    }
    expect(XUtils.encodeUTF8(opened)).toBe("hello fips");
});

test("fips async ecdh and aes-gcm roundtrip", async () => {
    setCryptoProfile("fips");
    const alice = await xBoxKeyPairAsync();
    const bob = await xBoxKeyPairAsync();
    const aliceShared = await xDHAsync(alice.secretKey, bob.publicKey);
    const bobShared = await xDHAsync(bob.secretKey, alice.publicKey);

    expect(XUtils.bytesEqual(aliceShared, bobShared)).toBe(true);

    const nonce = new Uint8Array(24);
    nonce.set(crypto.getRandomValues(new Uint8Array(24)));
    const plaintext = XUtils.decodeUTF8("portable fips path");

    const ciphertext = await xSecretboxAsync(plaintext, nonce, aliceShared);
    const decrypted = await xSecretboxOpenAsync(ciphertext, nonce, bobShared);

    if (decrypted === null) {
        throw new Error("Expected ciphertext to decrypt in fips mode.");
    }
    expect(XUtils.encodeUTF8(decrypted)).toBe("portable fips path");
});
