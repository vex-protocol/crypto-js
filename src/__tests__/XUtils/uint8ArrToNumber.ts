import { XUtils } from "../../index.js";

const { uint8ArrToNumber } = XUtils;

test("uint8ArrToNumber", () => {
    const cases: [number, number[]][] = [
        [255, [0, 0, 0, 0, 0, 255]],
        [65535, [0, 0, 0, 0, 255, 255]],
        [16777215, [0, 0, 0, 255, 255, 255]],
        [4294967295, [0, 0, 255, 255, 255, 255]],
        [1099511627775, [0, 255, 255, 255, 255, 255]],
        [281474976710655, [255, 255, 255, 255, 255, 255]],
    ];

    for (const [expected, buffer] of cases) {
        const actual = uint8ArrToNumber(Buffer.from(buffer));
        expect(actual === expected).toBe(true);
    }
});
