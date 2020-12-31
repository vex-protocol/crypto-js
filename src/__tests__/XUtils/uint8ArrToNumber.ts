import { XUtils } from "../../index";
const { uint8ArrToNumber, bytesEqual } = XUtils;

test("uint8ArrToNumber", () => {
    const numbers = [
        255,
        65535,
        16777215,
        4294967295,
        1099511627775,
        281474976710655,
    ];
    const buffers = [
        [0, 0, 0, 0, 0, 255],
        [0, 0, 0, 0, 255, 255],
        [0, 0, 0, 255, 255, 255],
        [0, 0, 255, 255, 255, 255],
        [0, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255],
    ];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < numbers.length; i++) {
        const num1 = uint8ArrToNumber(Buffer.from(buffers[i]));
        const num2 = numbers[i];
        expect(num1 === num2).toBe(true);
    }
});
