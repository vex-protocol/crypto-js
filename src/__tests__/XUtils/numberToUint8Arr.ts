import { XUtils } from "../../index";
const { numberToUint8Arr, bytesEqual } = XUtils;

test("numberToUint8Arr", () => {
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
        const arr = numberToUint8Arr(numbers[i]);
        expect(bytesEqual(arr, Buffer.from(buffers[i]))).toBe(true);
    }

    expect(() => numberToUint8Arr(281474976710656)).toThrow();
    expect(() => numberToUint8Arr(-1)).toThrow();
});
