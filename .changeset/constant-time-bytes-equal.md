---
"@vex-chat/crypto": patch
---

`XUtils.bytesEqual()` now uses a constant-time XOR-accumulator loop when the buffers are equal length, eliminating the timing side-channel in the previous early-exit implementation. No API change — callers get the same boolean result with identical behavior for unequal-length inputs.
