import nacl from "tweetnacl";
import { XKeyConvert, XUtils } from "..";
import _ from "lodash";

const ed25519Keys = {
    public: "8d0538a45bce3d6fd43cd80a247da063c67cd01da2e263758567a51db5b1f7c6",
    private:
        "f69c92fbb224e1d75c5dffb5e40946e6106baa89ad73dbb6ef0bec2d8562d8a28d0538a45bce3d6fd43cd80a247da063c67cd01da2e263758567a51db5b1f7c6",
};

const convertedX25519Keys = {
    public: "55c4ca5a1d8e2859e186f36564cc41c9c9882ed9dbc01be8ec9a36b106eeee5b",
    private: "10ed501acc2125730c294aa4b78eac989588d031015d1c77a75ea98aa7744b7a",
};

test("convertKeyPair", () => {
    const keys = keyPairFromString(ed25519Keys);
    const converted = XKeyConvert.convertKeyPair(keys);
    expect(_.isEqual(converted, keyPairFromString(convertedX25519Keys))).toBe(
        true
    );
});

test("convertPublicKey", () => {
    const keys = keyPairFromString(ed25519Keys);
    const convertedPublicKey = XKeyConvert.convertPublicKey(keys.publicKey);
    if (!convertedPublicKey) {
        throw new Error("Conversion failed.");
    }

    const correctConvertedKey = XUtils.decodeHex(convertedX25519Keys.public);
    expect(XUtils.bytesEqual(convertedPublicKey, correctConvertedKey)).toBe(
        true
    );
});

test("convertPrivateKey", () => {
    const keys = keyPairFromString(ed25519Keys);
    const convertedPrivateKey = XKeyConvert.convertSecretKey(keys.secretKey);
    if (!convertedPrivateKey) {
        throw new Error("Conversion failed.");
    }

    const correctConvertedKey = XUtils.decodeHex(convertedX25519Keys.private);
    expect(XUtils.bytesEqual(convertedPrivateKey, correctConvertedKey)).toBe(
        true
    );
});

function keyPairToString(
    keyPair: nacl.SignKeyPair | nacl.BoxKeyPair
): {
    public: string;
    private: string;
} {
    return {
        public: XUtils.encodeHex(keyPair.publicKey),
        private: XUtils.encodeHex(keyPair.secretKey),
    };
}

function keyPairFromString(strKeyPair: { public: string; private: string }) {
    return {
        publicKey: XUtils.decodeHex(strKeyPair.public),
        secretKey: XUtils.decodeHex(strKeyPair.private),
    };
}
