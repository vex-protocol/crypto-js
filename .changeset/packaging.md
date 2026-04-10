---
"@vex-chat/crypto": minor
---

Packaging and publish-metadata cleanup visible on npmjs.com.

- **`src/` now ships in the npm tarball** (`files: ["dist", "src", "LICENSE"]`) for consumer auditability. Test files in `src/__tests__/**` are excluded via `tsconfig.build.json`, so the tarball grows by the production source only.
- **`npm publish` now attaches provenance attestation** via the GitHub Actions OIDC token. npmjs.com displays the "Published via GitHub Actions" badge next to the version, and consumers can verify the tarball was built by this exact workflow at this exact commit.
- **`repository` URL corrected** — 1.1.1 accidentally pointed at `vex-chat/libvex-js`; now correctly points at `vex-protocol/crypto-js`. The "Repository" link on npmjs.com lands at the right place.
- **Package description updated** to `"Crypto primitives for the Vex encrypted chat platform"`.
- **Node engine floor raised** to `>=24.0.0` (`npm >=10.0.0`). Previously unspecified; `npm install` will now warn (or fail under `engine-strict`) on older Node versions.
