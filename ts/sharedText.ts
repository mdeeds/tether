import { Edit, Levenshtein } from "./levenshtein";

// Immutable string content based on a sequence of edits.
export class SharedText {

  static empty() {
    return new SharedText(null, []);
  }

  private value: string = null;
  private delta: Edit<string>[];
  readonly hash: number;
  readonly previous: SharedText;
  constructor(previous: SharedText, delta: Edit<string>[]) {
    this.previous = previous;
    this.delta = delta;

    this.hash = this.hashInternal();
  }

  child(newValue: string): SharedText {
    const previousLines = this.getLines();
    const newLines = Levenshtein.splitLines(newValue);
    const delta = Levenshtein.distance<string>(previousLines, newLines);
    return new SharedText(this, delta);
  }


  // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
  private hashInternal(): number {
    const value = this.getValue();
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
}
