/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 */

import { XUtils } from "../../index.js";

const { bytesEqual, numberToUint8Arr } = XUtils;

test("numberToUint8Arr", () => {
    const cases: [number, number[]][] = [
        [255, [0, 0, 0, 0, 0, 255]],
        [65535, [0, 0, 0, 0, 255, 255]],
        [16777215, [0, 0, 0, 255, 255, 255]],
        [4294967295, [0, 0, 255, 255, 255, 255]],
        [1099511627775, [0, 255, 255, 255, 255, 255]],
        [281474976710655, [255, 255, 255, 255, 255, 255]],
    ];

    for (const [number, buffer] of cases) {
        const arr = numberToUint8Arr(number);
        expect(bytesEqual(arr, Buffer.from(buffer))).toBe(true);
    }

    expect(() => numberToUint8Arr(281474976710656)).toThrow();
    expect(() => numberToUint8Arr(-1)).toThrow();
});
