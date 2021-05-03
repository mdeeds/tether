import { Log } from "./log";

/***
 * Data only class storing all of the identifiers for the shadows and text
 * channels
 */
export class SceneInfo {
  public shadowChannels: string[] = [];
  public textChannels: string[] = [];

  public mergeFrom(serialized: string) {
    Log.debug(`AAAAA: Merge from ${serialized}`);
    if (serialized === '') {
      return;
    }
    const dict = JSON.parse(serialized) as SceneInfo;
    for (const c of dict.shadowChannels) {
      if (this.shadowChannels.indexOf(c) < 0) {
        this.shadowChannels.push(c);
      }
    }
    this.shadowChannels.sort();
    for (const c of dict.textChannels) {
      if (this.textChannels.indexOf(c) < 0) {
        this.textChannels.push(c);
      }
    }
    this.textChannels.sort();
  }
}