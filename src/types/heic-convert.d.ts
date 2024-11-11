declare module "heic2any" {
  interface Options {
    blob: Blob;
    toType?: string;
    quality?: number;
  }

  function convert(options: Options): Promise<Blob | Blob[]>;
  export default convert;
}
