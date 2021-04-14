import { Comms } from "./comms";
import { Levenshtein } from "./levenshtein";
import { Patch } from "./patch";
import { SharedText } from "./sharedText";

export class SharedState {
  name: string;
  comms: Comms;
  state: Map<string, string> = new Map<string, string>();
  sharedContent: Map<string, SharedText> = new Map<string, SharedText>();

  // Maps a key to the known name:key pairs.
  allKeys: Map<string, Set<string>> = new Map<string, Set<string>>();
  // Constructs a new shared state from the perspective of `name`.
  constructor(name: string, comms: Comms) {
    this.name = name;
    this.comms = comms;
    comms.addListener((message) => { this.commsCallback(message); });
  }

  commsCallback(message: string) {
    const namedRegex = /(([^=:#]+):[^=:#]+)\=(.*)/;
    const namedMatch = message.match(namedRegex);
    const sharedRegex = /([^=:#]+)#([^=:#]+)\=(.*)/;
    const sharedMatch = message.match(sharedRegex);

    if (namedMatch) {
      const fullKey = namedMatch[1];
      const value = Buffer.from(namedMatch[3], 'base64').toString('binary');

      this.state.set(fullKey, value);
      const key = namedMatch[2];
      if (!this.allKeys.has(key)) {
        this.allKeys.set(key, new Set<string>());
      }
      this.allKeys.get(key).add(fullKey);
    } else if (sharedMatch) {
      const key = sharedMatch[1];
      const hash: number = parseInt(sharedMatch[2]);
      const json = Buffer.from(sharedMatch[3], 'base64').toString('binary');
      const patch = Object.assign(new Patch(), JSON.parse(json));
      if (!this.sharedContent.has(key)) {
        if (hash !== 0) {
          throw new Error(`Never seen ${key} before, and hash is non-zero.`);
        }
        this.sharedContent.set(key, SharedText.empty().applyPatch(patch));
      } else {
        const currentContent = this.sharedContent.get(key)
        const currentPatch = currentContent.makePatch(hash);
        currentPatch.merge(patch);
        const root = currentContent.getParent(hash);
        const newContent = root.applyPatch(currentPatch);
        this.sharedContent.set(key, newContent);
      }
    } else {
      throw new Error(`Failed to parse ${message}`);
    }
  }

  // Sets key value from current perspective
  setMy(key: string, value: string) {
    const fullKey = `${this.name}:${key}`;
    if (!this.allKeys.has(key)) {
      this.allKeys.set(key, new Set<string>());
    }
    this.allKeys.get(key).add(fullKey);
    this.state.set(fullKey, value);
    const encodedValue = Buffer.from(value, 'binary').toString('base64');
    this.comms.sendMessage(`${fullKey}=${encodedValue}`);
  }

  // Best effort update.  (E.g. text area)
  updateShared(key: string, value: string) {
    if (!this.sharedContent.has(key)) {
      this.sharedContent.set(key, SharedText.empty().child(value));
    } else {
      this.sharedContent.set(key, this.sharedContent.get(key).child(value));
    }
    const hash = this.sharedContent.get(key).hash;
    const encodedValue = Buffer.from(value, 'binary').toString('base64');
    this.comms.sendMessage(`${key}#${hash}=${encodedValue}`);
  }

  // Gets value from current perspective 
  getMy(key: string): string {
    const fullKey = `${this.name}:${key}`;
    if (this.state.has(fullKey) && this.sharedContent.has(key)) {
      throw new Error(`Key collision: '${key}'`);
    }
    if (this.state.has(fullKey)) {
      return this.state.get(fullKey);
    }
    if (this.sharedContent.has(key)) {
      return this.sharedContent.get(key).getValue();
    }
    return undefined;
  }

  // Gets values for all perspectives.  (E.g. shadows)
  getAll(key: string): string[] {
    const result: string[] = [];
    if (!this.allKeys.has(key)) {
      return result;
    }
    for (const fullKey of this.allKeys.get(key)) {
      result.push(this.state.get(fullKey));
    }
    return result;
  }

  // Gets the shared value for the key.  (E.g. text area)
  getShared(key: string): string {
    return this.state.get(key);
  }
}