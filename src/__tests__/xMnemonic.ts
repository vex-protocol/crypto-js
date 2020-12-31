import { xMnemonic, XUtils } from "..";

test("xMnemonic", () => {
    const IKM =
        "dfb3c08de7335cc352e2c063c8e6891a06e17bf0dfcb4eec8139fc5eaf482b0e";
    const correctMnemonic =
        "text own casino solar cupboard giant entire fix glow elbow pelican cross host sadness sell west exclude goat example weather turtle piano promote scene";

    const mnemonic = xMnemonic(XUtils.decodeHex(IKM));

    expect(mnemonic === correctMnemonic).toBe(true);
});
