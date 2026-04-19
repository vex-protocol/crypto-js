/**
 * Copyright (c) 2020-2026 Vex Heavy Industries LLC
 * Licensed under AGPL-3.0. See LICENSE for details.
 * Commercial licenses available at vex.wtf
 */

import { XUtils } from "../../index.js";
const { emptyHeader } = XUtils;

test("emptyHeader", () => {
    const headerData =
        "0000000000000000000000000000000000000000000000000000000000000000";

    const eHeader = emptyHeader();
    const testEmptyHeader = XUtils.decodeHex(headerData);

    expect(XUtils.bytesEqual(eHeader, testEmptyHeader)).toBe(true);
});
