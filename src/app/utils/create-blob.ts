export default async function createBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        return reject("Failed to create blob from canvas");
      }
      resolve(blob);
    });
  });
}
