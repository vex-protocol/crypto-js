import { xConcat, XUtils } from "..";

test("xConcat", () => {
    const data1 = "dead";
    const data2 = "beef";
    const data3 = "bead";
    const correctConcatData = data1 + data2 + data3;

    const concatData = XUtils.encodeHex(
        xConcat(
            XUtils.decodeHex(data1),
            XUtils.decodeHex(data2),
            XUtils.decodeHex(data3)
        )
    );

    expect(concatData === correctConcatData).toBe(true);
});
