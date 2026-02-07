import { xEncode, XUtils } from "..";

test("xEncode", () => {
  const PK = "3a488fc006156e77e58793846c204f17e0df88e914fc7638a084524a9124bf87";
  const correctEncoded =
    "00013a488fc006156e77e58793846c204f17e0df88e914fc7638a084524a9124bf87";

  const encoded = XUtils.encodeHex(xEncode("X25519", XUtils.decodeHex(PK)));
  expect(encoded === correctEncoded).toBe(true);
});
