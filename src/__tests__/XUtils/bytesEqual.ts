/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 */

import { XUtils } from "../../index.js";
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
