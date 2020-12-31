import { XUtils } from "../../index";
const {
    encodeHex,
    decodeHex,
    encodeUTF8,
    decodeUTF8,
    encodeBase64,
    decodeBase64,
} = XUtils;

test("Encodes and decodes hex", () => {
    const data = [
        "a2dc693b93b3e2a31eb2b54f26f43b8ce971c6b9b4197544",
        "9d9158ea82750c0b164834789f216d5a17a223d87e082199",
        "e32079ba7c8ed5e62123ab55386689c2ec9f480ebb82f05c",
        "e037b3f87bea23b8afea27c7ad173f5a43d0050559fbe091",
        "df3cefb0f980f96eb5d6cc996702d6d166413fb2785772b1",
        "6a328c1b103d1b331c9759ddde6c5df5753010a3c9881514",
        "c5ad6470766845c420205700aaaed806456cae49b905aeed",
        "5dc12b62156b1f68698b36b42e3e2f4716dffee09b768030",
        "2985705f1f590b11e027ea6a05cbe4e0d351ab81748cbea0",
        "6455945ea7110197a17a809cb973c2007eff629d5549273a",
    ];

    for (const value of data) {
        expect(encodeHex(decodeHex(value)) === value).toBe(true);
    }
});

test("Encodes and decodes utf8", () => {
    const data = [
        "�>M�)Ik7:�L?\x1C=�\x00��#�\x19H�ַ KL9/\x1D",
        "��\x0E\x0F�e\x17aj*ڷ���S4��i�BsOI�`����U",
        "���d8\x7F���.��,9ZmIu\x02�Jt��Uz̀��\x14",
        // tslint:disable-next-line: quotemark
        '��L��:�\x02��\x1E\\\x04�_jw��v�������\x01�"\x1C�',
        "\x05;�\x01!�\x0F�-�֛��ʨ�`��\x14�\x03����d�~�o",
        // tslint:disable-next-line: quotemark
        '\x02\x13\x12l��"`ϼ�"\x17�D��r��0\x00!�4V�Wi\x1B\x17',
        "��y\x1FS�\\�p�4���%Vt��\n�?vHGg,`b%(\f",
        "<b�N�N!FG�-�*�I�Z����\x0F\x0B�{ʌ��(.",
        "�z�&�0���miouj�P�\x7F�_3\x1D���\x00���i��",
        "3\x01cgT\x13�U�\x05,�;���|�P��X�q�/{\x19\x1E��8",
    ];

    for (const value of data) {
        expect(encodeUTF8(decodeUTF8(value)) === value).toBe(true);
    }
});

test("Encodes and decodes base64", () => {
    const data = [
        "+UMP/v5VnVF/qSrSDfcLAXZ9jEauYFrbAcgtE3z46bI=",
        "Cb+zq/R1zMRSEMGA1p47XWzwD48NZ/JqLO1p1hUnpEY=",
        "mODgEB/U3MnvMHuG5fQ0xv8NRqo24diRlzyzJ4/Et7g=",
        "vvYVuOpi3/pMdP49C7TgTqEdk02/LlcIY9a0CPyOJsc=",
        "S6vBIf8WXmPi/BPV3ei9CMgdanxBNiTl8oHQ/HSnvsU=",
        "0i2WNMF8I5ewIAefTbBBjhS3sZwZ9tILLpksPE00bt8=",
        "W3SHYUb/F3sWFytIYNG4TCBgrDT80L0A9bB335nU8/8=",
        "vbov+TNLyWc+VdpH7egFOifdKup26ertUlutTv8kFyY=",
        "re9JVfQRSsXaaUG9uLoMd/bW05xDcCnk0qaPh6CUn90=",
        "X9AyjBOM9tAsXrINjeDr5wgMiZNlkK5HlOOtDBwMeFw=",
    ];

    for (const value of data) {
        expect(encodeBase64(decodeBase64(value)) === value).toBe(true);
    }
});
