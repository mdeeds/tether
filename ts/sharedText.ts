import { Edit, Levenshtein } from "./levenshtein";
import { Patch } from "./patch";

// Immutable string content based on a sequence of edits.
export class SharedText {

  static empty(): SharedText {
    return new SharedText(null, []);
  }

  private value: string = null;
  private delta: Edit<string>[];
  readonly hash: number;
  readonly previous: SharedText;

  private constructor(previous: SharedText, delta: Edit<string>[]) {
    this.previous = previous;
    this.delta = delta;
    this.hash = this.hashInternal();
  }

  child(newValue: string): SharedText {
    const previousLines = this.getLines();
    const newLines = Levenshtein.splitLines(newValue);
    const delta = Levenshtein.distance<string>(previousLines, newLines);

    if (this.previous &&
      delta.length === 1 && this.previous.delta.length === 1) {
      if (delta[0].index === this.previous.delta[0].index &&
        delta[0].operation === "edit" &&
        this.previous.delta[0].operation === "edit") {
        return new SharedText(this.previous, delta);
      }
    }

    return new SharedText(this, delta);
  }

  getParent(hash: number): SharedText {
    let curr: SharedText = this;
    while (curr != null && curr.hash != hash) {
      curr = curr.previous;
    }
    if (curr === null) {
      throw `Hash not found: ${hash}`;
    }
    return curr;
  }

  makePatch(hash: number): Patch {
    let root: SharedText = this;
    const patchStack: SharedText[] = [];
    while (root != null && root.hash != hash) {
      patchStack.push(root);
      root = root.previous;
    }
    if (root === null) {
      throw `Hash not found: ${hash}`;
    }
    const patch: Patch = new Patch();
    while (patchStack.length > 0) {
      const st = patchStack.pop();
      patch.push(st.delta);
    }
    return patch;
  }

  applyPatch(patch: Patch): SharedText {
    return new SharedText(this, patch.getEdits());
  }

  merge(other: SharedText): SharedText {
    throw "Not implemented";
  }

  // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
  private hashInternal(): number {
    const value = Levenshtein.combineLines(this.getLines());
    let hash = 0;
    for (let i = 0; i < value.length; ++i) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      // Convert to 32bit integer
      hash = hash & hash;
    }
    return hash;
  }

  getValue(): string {
    if (this.value) {
      return this.value;
    } else {
      return Levenshtein.combineLines(this.getLines());
    }
  }

  private getLines(): string[] {
    if (this.previous === null && this.delta.length === 0) {
      return [""];
    } else {
      const lines = this.previous.getLines();
      Levenshtein.applyEdits<string>(lines, this.delta);
      return lines;
    }
  }

  printDebugDeltas() {
    if (this.previous) {
      this.previous.printDebugDeltas();
    }
    console.log(JSON.stringify(this.delta));
  }
}
