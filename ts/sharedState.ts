export class SharedState {
  // Constructs a new shared state from the perspective of `name`.
  constructor(name: string) {
  }

  // Sets key value from current perspective
  setMy(key: string, value: string) {
    throw "Not implemented";
  }

  // Gets value from current perspective 
  getMy(key: string): string {
    throw "Not implemented";
  }

  // Gets values for all perspectives.  (E.g. shadows)
  getAll(key: string): string[] {
    throw "Not implemented";
  }

  // Gets the shared value for the key.  (E.g. text area)
  getShared(key: string): string {
    throw "Not implemented";
  }

  // Best effort update.  (E.g. text area)
  updateShared(key: string, value: string) {

  }

}