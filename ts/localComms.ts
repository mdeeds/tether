import { Comms, MessageCallback } from "./comms";

export class LocalComms implements Comms {
  callbacks: MessageCallback[] = [];
  constructor() {
  }
  sendMessage(message: string): void {
    for (const c of this.callbacks) {
      c(message);
    }
  }

  addListener(callback: MessageCallback): void {
    this.callbacks.push(callback);
  }
}