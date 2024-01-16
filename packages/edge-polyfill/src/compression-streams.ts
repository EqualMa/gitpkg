import {
  makeCompressionStream,
  makeDecompressionStream,
} from "compression-streams-polyfill/ponyfill";

const MyCompressionStream =
  typeof CompressionStream === "undefined"
    ? makeCompressionStream(TransformStream)
    : CompressionStream;

const MyDecompressionStream =
  typeof DecompressionStream === "undefined"
    ? makeDecompressionStream(TransformStream)
    : DecompressionStream;

export {
  MyCompressionStream as CompressionStream,
  MyDecompressionStream as DecompressionStream,
};
