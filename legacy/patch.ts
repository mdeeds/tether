import { Edit, Levenshtein } from "./levenshtein";

/***
 * A mutable collection of edits.
 */
export class Patch {
  private edits: Edit<string>[] = [];
  constructor() { }

  // Pushes edits onto the end of this patch.  Edits are applied in order.
  push(edits: Edit<string>[]) {
    this.edits.push(...edits);
  }

  /***
   * returns the edits in this patch.
   */
  getEdits(): Edit<string>[] {
    if (this.edits === undefined) {
      throw new Error("No edits.  Invalid state.");
    }
    return this.edits;
  }

  // Performs a bubble sort on the edits to reorder the edits
  // in decreasing order by index.  Operations on the same line
  // are orderd: add/edit/delete
  sort() {
    // Same line cases:
    // edit,i,a ; edit,i,b -> edit,i,b
    // edit,i,a ; delete,i -> delete,i
    // edit,i,a ; add,i,b -> add,i,b ; edit,i+1,a
    // add,i,a ; edit,i,b -> add,i,b
    // add,i,a ; add,i,b -> No change
    // add,i,a ; delete,i -> <removed>
    // delete,i ; edit,i,b -> edit,i+1,b ; delete,i
    // delete,i ; add,i,b -> edit,i,b
    // delete,i ; delete,i -> No 

    // Swap line cases (i < j)
    // add,i,a ; add,j,b ->  add,j-1,b ; add,i,a
    // add,i,a ; edit,j,b ->  edit,j-1,b ; add,i,a
    // add,i,a ; delete,j ->  delete,j-1 ; add,i,a
    // edit,i,a ; add,j,b ->  add,j,b ; edit,i,a
    // edit,i,a ; edit,j,b ->  edit,j,b ; edit,i,a
    // edit,i,a ; delete,j ->  delete,j ; edit,i,a
    // delete,i ; add,j,b ->  add,j+1,b ; delete,i
    // delete,i ; edit,j,b ->  edit,j+1,b ; delete,i
    // delete,i ; delete,j ->  delete,j+1 ; delete,i


    throw "Not implemented";
  }

  /***
   * Merges other patch into this one.  Edits are applied from both
   * patches highest index first.
   ***/
  merge(that: Patch) {
    this.sort();
    that.sort();
    const merged: Edit<string>[] = [];

    let thisIndex = 0;
    let thatIndex = 0;

    while (thisIndex < this.edits.length && thatIndex < that.edits.length) {
      if (that.edits[thatIndex].index > this.edits[thisIndex].index) {
        merged.push(that.edits[thatIndex]);
        ++thatIndex;
        continue;
      }
      if (this.edits[thisIndex].index > that.edits[thatIndex].index) {
        merged.push(this.edits[thisIndex]);
        ++thisIndex;
        continue;
      }
      // indexes are equal
      const thisOp = this.edits[thisIndex].operation;
      const thatOp = that.edits[thatIndex].operation;

      if (thisOp === "delete") {
        if (thatOp === "delete" || thatOp === "edit") {
          merged.push(new Edit(thisIndex, "delete", null));
        } else {  // thatOp === "add"
          merged.push(that.edits[thatIndex]);  // add
          merged.push(this.edits[thisIndex]);  // delete
        }
      } else if (thatOp === "delete") {
        if (thisOp === "edit") {  // thisOp !== "delete" per above.
          merged.push(new Edit(thisIndex, "delete", null));
        } else {  // thisOp === "add"
          merged.push(this.edits[thisIndex]);  // add
          merged.push(that.edits[thatIndex]);  // delete
        }
      } else if (thisOp === "add") {
        // TODO!!!
      }
      ++thisIndex;
      ++thatIndex;
    }
  }
}