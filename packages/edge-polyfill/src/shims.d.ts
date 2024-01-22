declare module "readable-stream" {
  export { default } from "stream";
}

declare module "readable-stream/lib/ours/browser" {
  export { default } from "readable-stream";
}

declare module "readable-stream/lib/internal/streams/string_decoder" {
  export { default } from "string_decoder";
}
