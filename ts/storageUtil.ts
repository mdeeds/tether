export class StorageUtil {
  private static cacheBuster = `${Math.random()}`;

  private static cache = new Map<string, string>();
  static get(fileName: string): Promise<string> {
    if (StorageUtil.cache.has(fileName)) {
      return new Promise((resolve, reject) => {
        resolve(StorageUtil.cache.get(fileName));
      })
    }
    return new Promise((resolve, reject) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = async () => {
        if (xhttp.readyState == 4) {
          if (xhttp.status == 200) {
            StorageUtil.cache.set(fileName, xhttp.response);
            resolve(xhttp.response);
          } else {
            reject(xhttp.response);
          }
        }
      };
      console.log(`GET ${fileName}?_=${StorageUtil.cacheBuster}`);
      xhttp.open("GET", fileName, true);
      xhttp.responseType = 'text';
      xhttp.send();
    });
  }
}