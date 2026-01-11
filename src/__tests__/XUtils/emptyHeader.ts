import { XUtils } from "../../index";
const { emptyHeader } = XUtils;

test("emptyHeader", () => {
  const headerData =
    "0000000000000000000000000000000000000000000000000000000000000000";

  const eHeader = emptyHeader();
  const testEmptyHeader = XUtils.decodeHex(headerData);

  expect(XUtils.bytesEqual(eHeader, testEmptyHeader)).toBe(true);
});
