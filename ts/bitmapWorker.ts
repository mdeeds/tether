type BitmapResolution = (bitmap: ImageBitmap) => void;

export class BitmapWorker {
  private static cache = new Map<string, ImageBitmap>();

  private static callbacks = new Map<string, BitmapResolution[]>();

  public static get(uri: string): Promise<ImageBitmap> {
    console.log('get');
    if (BitmapWorker.cache.has(uri)) {
      return new Promise((resolve, reject) => {
        console.log('in cache');
        resolve(BitmapWorker.cache.get(uri));
      })
    }
    return new Promise((resolve, reject) => {
      console.log('adding callback');
      if (!BitmapWorker.callbacks.has(uri)) {
        BitmapWorker.callbacks.set(uri, []);
      }
      BitmapWorker.callbacks.get(uri).push(resolve);
      postMessage({ command: 'getBitmap', uri: uri }, null);
    });
  }

  public static set(uri: string, bitmap: ImageBitmap) {
    console.log('set');
    BitmapWorker.cache.set(uri, bitmap);
    for (const cb of BitmapWorker.callbacks.get(uri)) {
      console.log('callback');
      cb(bitmap);
    }
  }
}