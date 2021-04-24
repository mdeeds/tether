import { PeerGroupInterface } from "./peerGroupInterface";
import { LockedText } from "./lockedText";
import { PeerGroupMux } from "./peerGroupMux";
import { Log } from "./log";

export class SharedState {
  name: string;
  generalComms: PeerGroupInterface;
  mux: PeerGroupMux;
  sharedContent: Map<string, LockedText> = new Map<string, LockedText>();
  // Constructs a new shared state from the perspective of `name`.
  constructor(comms: PeerGroupInterface) {
    this.mux = new PeerGroupMux(comms);
    this.generalComms = this.mux.get('sharedState');
  }

  // Sets key value from current perspective
  set(key: string, value: string) {
    if (this.sharedContent.has(key)) {
      const content = this.sharedContent.get(key);
      if (content.hasLock()) {
        content.update(value);
      } else {
        content.takeLock().then((updated: string) => {
          // Ideally we would merge at this point, but too bad. \_(u.u)_/
        });
      }
    } else {
      const content = new LockedText(this.mux.get(`locked${key}`), value);
      this.sharedContent.set(key, content);
    }
  }

  // Gets value from current perspective 
  get(key: string): string {
    if (this.sharedContent.has(key)) {
      return this.sharedContent.get(key).get();
    }
    return undefined;
  }

  // Gets values for all keys with specified prefix
  getAll(prefix: string): string[] {
    const result: string[] = [];
    for (const [key, text] of this.sharedContent.entries()) {
      if (key.startsWith(prefix)) {
        result.push(text.get());
      }
    }
    return result;
  }
}