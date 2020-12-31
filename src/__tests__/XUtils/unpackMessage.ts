import { XTypes } from "@vex-chat/types";
// tslint:disable-next-line: no-implicit-dependencies
import _ from "lodash";
import { XUtils } from "../../index";
const { unpackMessage, emptyHeader, bytesEqual } = XUtils;

test("packMessage", () => {
    const testHeader = emptyHeader();
    const testMessage: XTypes.WS.IResourceMsg = {
        type: "resource",
        resourceType: "server",
        action: "create",
        transmissionID: "8154ac29-54fb-407c-8353-0f67742bb7c4",
        data: "A Server Name",
    };

    const packedTestMessage =
        "000000000000000000000000000000000000000000000000000000000000000085a474797065a87265736f75726365ac7265736f7572636554797065a6736572766572a6616374696f6ea6637265617465ae7472616e736d697373696f6e4944d92438313534616332392d353466622d343037632d383335332d306636373734326262376334a464617461ad4120536572766572204e616d65";
    const messageData = XUtils.decodeHex(packedTestMessage);

    const [unpackedHeader, unpackedMessage] = unpackMessage(messageData);
    expect(bytesEqual(unpackedHeader, testHeader)).toBe(true);
    expect(_.isEqual(testMessage, unpackedMessage)).toBe(true);
});
