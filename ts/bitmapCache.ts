export class BitmapCache {
  private static cache = new Map<string, ImageBitmap>();

  static Clone(source: ImageBitmap): Promise<ImageBitmap> {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    return createImageBitmap(canvas);
  }

  static get(uri: string): Promise<ImageBitmap> {
    if (BitmapCache.cache.has(uri)) {
      return new Promise(async (resolve, reject) => {
        resolve(
          await BitmapCache.Clone(BitmapCache.cache.get(uri)));
      });
    }
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.addEventListener('load', async (ev) => {
        const bitmap = await createImageBitmap(img);
        BitmapCache.cache.set(uri, await BitmapCache.Clone(bitmap));
        resolve(bitmap);
      });
      img.src = uri;
    });
  }
}