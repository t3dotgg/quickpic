declare module "heic-convert" {
  interface ConvertOptions {
    buffer: Buffer;
    format: "PNG" | "JPEG";
    quality?: number;
  }

  function convert(options: ConvertOptions): Promise<Buffer>;
  export default convert;
}
