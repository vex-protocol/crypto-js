import { xHMAC, XUtils } from "..";
import { Packr } from "msgpackr";
import { createHmac } from "crypto";

test("xHMAC", () => {
  const message = {
    hello: "world",
  };
  const SK = "b45203ef77c0a7fe7f771297f3e5c8248fe5b9f18ecf77faf8a8cef1058e630a";

  // We recreate the packer exactly as it is in index.ts
  const packer = new Packr({
    useRecords: false,
    moreTypes: true,
  });

  // Calculate what the HMAC *should* be using the new packer
  const packedMsg = packer.pack(message);
  const hmacGen = createHmac("sha256", Buffer.from(XUtils.decodeHex(SK)));
  hmacGen.update(packedMsg);
  const expectedHMAC = XUtils.encodeHex(Uint8Array.from(hmacGen.digest()));

  // Run the actual function
  const hmac = XUtils.encodeHex(xHMAC(message, XUtils.decodeHex(SK)));

  // Compare
  expect(hmac).toBe(expectedHMAC);
});
