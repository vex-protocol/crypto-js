import { XUtils } from "../../index";
const { saveKeyFile, loadKeyFile } = XUtils;
import fs from "fs";
import path from "path";

test("Save a key and reload it", () => {
  const secretKey =
    "86fbed70aa300a523979a318799d6d523a6cb4c84bfb865d3a3e52a568ec6a63560eeaae57a57d62668898355c2218b142d6069bf9f53a00b5c3c46dd257c4dc";
  const password = "hunter2";
  const fileName = path.join(__dirname, "test.keyfile");

  try {
    saveKeyFile(fileName, password, secretKey);
    const decryptedKey = loadKeyFile(fileName, password);
    expect(secretKey === decryptedKey).toBe(true);
  } finally {
    // cleanup the file
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
  }
});
