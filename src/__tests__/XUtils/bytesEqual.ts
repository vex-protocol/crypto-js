import { XUtils } from "../../index";
const { bytesEqual } = XUtils;

test("bytesEqual", () => {
  const bytes = [25, 23, 122, 142, 73, 92, 58];

  const buf1 = Buffer.from(bytes);
  const buf2 = Buffer.from(bytes);

  expect(bytesEqual(buf1, buf2)).toBe(true);

  bytes[0] = 0;
  const buf3 = Buffer.from(bytes);

  expect(bytesEqual(buf1, buf3)).toBe(false);
});
