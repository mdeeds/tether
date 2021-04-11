import { Comms } from "./comms";
import { Levenshtein } from "./levenshtein";
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
    const kvRegex = /([^=]+)\=(.*)/;
    const match = message.match(kvRegex);
    if (!match[1] || !match[2]) {
      throw new Error(`Failed to parse ${message}`);
    }
    this.state.set(match[1],
      Buffer.from(match[2], 'base64').toString('binary'));
    const namedRegex = /([^:]+):(.*)/;
    const match2 = match[1].match(namedRegex);
    if (match2[2]) {
      const key = match2[2];
      if (!this.allKeys.has(key)) {
        this.allKeys.set(key, new Set<string>());
      }
      this.allKeys.get(key).add(match[1]);
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