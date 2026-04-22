/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 *
 * More async-API coverage: at-rest key wrap + from-secret key restore.
 * Paired with `xAsyncProfile.ts` in the `async-api` Vitest project (see `vitest.config.ts`).
 */

import {
    setCryptoProfile,
    xBoxKeyPairAsync,
    xBoxKeyPairFromSecretAsync,
    xSignKeyPairAsync,
    xSignKeyPairFromSecretAsync,
    XUtils,
} from "../index.js";

afterEach(() => {
    setCryptoProfile("tweetnacl");
});

const fixedIterations = 5000;

test("encryptKeyDataAsync / decryptKeyDataAsync (tweetnacl)", async () => {
    setCryptoProfile("tweetnacl");
    const { publicKey, secretKey } = await xSignKeyPairAsync();
    void publicKey;
    const hex = XUtils.encodeHex(secretKey);
    const enc = await XUtils.encryptKeyDataAsync(
        "correct horse",
        hex,
        fixedIterations,
    );
    const out = await XUtils.decryptKeyDataAsync(enc, "correct horse");
    expect(out).toBe(hex);
    await expect(XUtils.decryptKeyDataAsync(enc, "wrong")).rejects.toThrow();
});

test("encryptKeyDataAsync / decryptKeyDataAsync (FIPS)", async () => {
    setCryptoProfile("fips");
    const { publicKey, secretKey } = await xSignKeyPairAsync();
    void publicKey;
    const hex = XUtils.encodeHex(secretKey);
    const enc = await XUtils.encryptKeyDataAsync(
        "battery staple",
        hex,
        fixedIterations,
    );
    const out = await XUtils.decryptKeyDataAsync(enc, "battery staple");
    expect(out).toBe(hex);
});

test("xBoxKeyPairFromSecretAsync roundtrip (tweetnacl)", async () => {
    setCryptoProfile("tweetnacl");
    const a = await xBoxKeyPairAsync();
    const b = await xBoxKeyPairFromSecretAsync(a.secretKey);
    expect(XUtils.bytesEqual(a.publicKey, b.publicKey)).toBe(true);
    expect(XUtils.bytesEqual(a.secretKey, b.secretKey)).toBe(true);
});

test("xBoxKeyPairFromSecretAsync roundtrip (FIPS)", async () => {
    setCryptoProfile("fips");
    const a = await xBoxKeyPairAsync();
    const b = await xBoxKeyPairFromSecretAsync(a.secretKey);
    expect(XUtils.bytesEqual(a.publicKey, b.publicKey)).toBe(true);
    expect(XUtils.bytesEqual(a.secretKey, b.secretKey)).toBe(true);
});

test("xSignKeyPairFromSecretAsync roundtrip (tweetnacl)", async () => {
    setCryptoProfile("tweetnacl");
    const a = await xSignKeyPairAsync();
    const b = await xSignKeyPairFromSecretAsync(a.secretKey);
    expect(XUtils.bytesEqual(a.publicKey, b.publicKey)).toBe(true);
    expect(XUtils.bytesEqual(a.secretKey, b.secretKey)).toBe(true);
});

test("xSignKeyPairFromSecretAsync roundtrip (FIPS)", async () => {
    setCryptoProfile("fips");
    const a = await xSignKeyPairAsync();
    const b = await xSignKeyPairFromSecretAsync(a.secretKey);
    expect(XUtils.bytesEqual(a.publicKey, b.publicKey)).toBe(true);
    expect(XUtils.bytesEqual(a.secretKey, b.secretKey)).toBe(true);
});
