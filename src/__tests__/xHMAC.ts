import { xHMAC, XUtils } from "..";

test("xHMAC", () => {
    const message = {
        hello: "world",
    };
    const SK =
        "b45203ef77c0a7fe7f771297f3e5c8248fe5b9f18ecf77faf8a8cef1058e630a";
    const correctHMAC =
        "a9b398cb69d356f0376c3ec78bc16aa885fdf3cd5be2203f0cc15a3340f3b0fe";

    const hmac = XUtils.encodeHex(xHMAC(message, XUtils.decodeHex(SK)));

    expect(correctHMAC === hmac).toBe(true);
});
