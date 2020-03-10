declare module "gunzip-maybe" {
  namespace GunzipMaybe {}
  function GunzipMaybe(): import("stream").Duplex;
  export default GunzipMaybe;
}
