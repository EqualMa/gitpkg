// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shims.d.ts" />

import stream from "readable-stream";

const { pipeline } = stream.promises;
export { pipeline };
