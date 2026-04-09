import type { ResourceMsg } from "@vex-chat/types";

import { XUtils } from "../../index.js";
const { emptyHeader, packMessage, unpackMessage } = XUtils;

test("packMessage Round Trip", () => {
    const testMessage: ResourceMsg = {
        action: "create",
        data: "A Server Name",
        resourceType: "server",
        transmissionID: "8154ac29-54fb-407c-8353-0f67742bb7c4",
        type: "resource",
    };

    // Pack the message using the new implementation
    const packedBytes = packMessage(testMessage, emptyHeader());

    // Unpack it immediately to verify consistency (Round Trip)
    const [header, body] = unpackMessage(packedBytes);

    expect(XUtils.bytesEqual(header, emptyHeader())).toBe(true);
    expect(body).toEqual(testMessage);
});
