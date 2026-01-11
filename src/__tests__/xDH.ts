import { xDH, XUtils } from "..";

test("xDH", () => {
  const myPrivateKey =
    "918ed243e2c6c507168b20e8b167cff33a10c30e99e8defe28dc2147f5cce703";
  const theirPublicKey =
    "6f4cc1ffc4009bd4f94628ba5922e40afa3491f0daa43ec9da0f7dc39bb1c026";

  const correctDerivedKey =
    "19a8594bdcf875ec9d4b8b9615ea8b73a0b327bb64b8f727dd2dee3a603a2230";
  const derivedKey = XUtils.encodeHex(
    xDH(XUtils.decodeHex(myPrivateKey), XUtils.decodeHex(theirPublicKey)),
  );

  expect(correctDerivedKey === derivedKey).toBe(true);
});
