type BitmapResolution = (bitmap: ImageBitmap) => void;

export class BitmapWorker {
  private static cache = new Map<string, ImageBitmap>();

  private static callbacks = new Map<string, BitmapResolution[]>();

  public static get(uri: string): Promise<ImageBitmap> {
    if (BitmapWorker.cache.has(uri)) {
      return new Promise((resolve, reject) => {
        resolve(BitmapWorker.cache.get(uri));
      })
    }
    return new Promise((resolve, reject) => {
      if (!BitmapWorker.callbacks.has(uri)) {
        BitmapWorker.callbacks.set(uri, []);
      }
      BitmapWorker.callbacks.get(uri).push(resolve);
      postMessage({ command: 'getBitmap', uri: uri }, null);
    });
  }

  public static set(uri: string, bitmap: ImageBitmap) {
    BitmapWorker.cache.set(uri, bitmap);
    for (const cb of BitmapWorker.callbacks.get(uri)) {
      cb(bitmap);
    }
  }
}