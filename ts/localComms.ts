import { Comms, MessageCallback } from "./comms";

export class LocalComms implements Comms {
  callbacks: MessageCallback[] = [];
  constructor() {
  }
  sendMessage(message: string): void {
    // We use a timeout to cause execution order to be similar to 
    // how it would be if there were a network.
    setTimeout(() => {
      for (const c of this.callbacks) {
        c(message);
      }
    }, 0);
  }

  addListener(callback: MessageCallback): void {
    this.callbacks.push(callback);
  }
}