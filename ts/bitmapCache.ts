export class BitmapCache {
  private static cache = new Map<string, ImageBitmap>();

  static get(uri: string): Promise<ImageBitmap> {
    if (BitmapCache.cache.has(uri)) {
      return new Promise((resolve, reject) => {
        resolve(BitmapCache.cache.get(uri));
      });
    }
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.addEventListener('load', async (ev) => {
        const bitmap = await createImageBitmap(img);
        BitmapCache.cache.set(uri, bitmap);
        resolve(bitmap);
      });
      img.src = uri;
    });
  }
}