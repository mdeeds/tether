
type Operation = ("edit" | "add" | "delete");

export class Edit<T> {
  index: number;
  operation: Operation;
  value: T;
  constructor(index: number, operation: Operation, value: T = null) {
    this.index = index;
    this.operation = operation;
    this.value = value;
  }
}

export class Levenshtein<T> {
  static splitLines(text: string): string[] {
    return text.split("\n");
  }

  static asEdits(text: string): Edit<string>[] {
    return Levenshtein.distance<string>([], Levenshtein.splitLines(text));
  }

  static combineLines(lines: string[]): string {
    return lines.join("\n");
  }

  static applyEdits<T>(s: T[], edits: Edit<T>[]) {
    if (edits === undefined) {
      throw new Error("Edits are required.");
    }
    for (const edit of edits) {
      if (edit.operation === "edit") {
        s[edit.index] = edit.value;
      } else if (edit.operation === "add") {
        s.splice(edit.index, 0, edit.value);
      } else if (edit.operation === "delete") {
        s.splice(edit.index, 1);
      }
    }
  }

  private static generateEdits<T>(d: number[][], s: T[], t: T[]): Edit<T>[] {
    const result: Edit<T>[] = [];
    let i = s.length - 1;
    let j = t.length - 1;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i - 1][j - 1] <= d[i][j - 1] &&
        d[i - 1][j - 1] <= d[i - 1][j]) {
        if (d[i - 1][j - 1] < d[i][j]) {
          result.push(new Edit(i, "edit", t[j]));
        }
        --i;
        --j;
      } else if (i > 0 && (j === 0 || (d[i - 1][j] <= d[i][j - 1] &&
        d[i - 1][j] < d[i - 1][j - 1]))) {
        if (i === 1 && j === 0 && s[1] === t[0]) {
          // Special case for delete at front
          result.push(new Edit(0, "delete"));
        } else {
          result.push(new Edit(i, "delete"));
        }
        --i;
      } else if (j > 0 && (i === 0 || (d[i][j - 1] <= d[i - 1][j] &&
        d[i][j - 1] < d[i - 1][j - 1]))) {
        if (i === 0 && j === 1 && s[0] === t[1]) {
          // Special case for insert at front.
          result.push(new Edit(i, "add", t[j - 1]));
        } else {
          result.push(new Edit(i + 1, "add", t[j]));
        }
        --j;
      } else {
        console.error("Implementation error.")
      }
    }
    if (result.length === 0 || result[0].index != 0) {
      if (s[0] != t[0]) {
        result.push(new Edit(0, "edit", t[0]));
      }
    }
    return result;
  }

  // Edits are always arranged in reverse order with the largest
  // indexes last.  This is also the order in which they should be
  // applied.
  static distance<T>(s: T[], t: T[]): Edit<T>[] {
    const d: number[][] = [];

    for (let i = 0; i < s.length; ++i) {
      let a = [];
      d.push(a);
      for (let j = 0; j < t.length; ++j) {
        a.push(0);
      }
    }
    for (let i = 0; i < s.length; ++i) {
      d[i][0] = i;
    }
    for (let j = 0; j < t.length; ++j) {
      d[0][j] = j;
    }

    let substitutionCost: number;
    for (let j = 1; j < t.length; ++j) {
      for (let i = 1; i < s.length; ++i) {
        if (s[i] === t[j]) {
          substitutionCost = 0;
        } else {
          substitutionCost = 1;
        }
        let cost = null;
        if (d[i - 1][j] < d[i][j - 1] &&
          d[i - 1][j] + 1 < d[i - 1][j - 1] + substitutionCost) {
          cost = d[i - 1][j] + 1;
        } else if (d[i][j - 1] < d[i - 1][j] &&
          d[i][j - 1] + 1 < d[i - 1][j - 1] + substitutionCost) {
          cost = d[i][j - 1] + 1;
        } else {
          cost = d[i - 1][j - 1] + substitutionCost;
        }
        d[i][j] = cost;
      }
    }
    // console.log(`${JSON.stringify(d)}`);

    return this.generateEdits(d, s, t);
  }
}