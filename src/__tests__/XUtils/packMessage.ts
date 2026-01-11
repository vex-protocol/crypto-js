import { IResourceMsg } from "@vex-chat/types";
import _ from "lodash";
import { XUtils } from "../../index";
const { packMessage, unpackMessage, emptyHeader } = XUtils;

test("packMessage Round Trip", () => {
  const testMessage: IResourceMsg = {
    type: "resource",
    resourceType: "server",
    action: "create",
    transmissionID: "8154ac29-54fb-407c-8353-0f67742bb7c4",
    data: "A Server Name",
  };

  // Pack the message using the new implementation
  const packedBytes = packMessage(testMessage, emptyHeader());

  // Unpack it immediately to verify consistency (Round Trip)
  const [header, body] = unpackMessage(packedBytes);

  expect(XUtils.bytesEqual(header, emptyHeader())).toBe(true);
  expect(_.isEqual(body, testMessage)).toBe(true);
});
