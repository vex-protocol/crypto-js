import { XUtils } from "../../index";
const { encodeHex, decodeHex } = XUtils;

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
