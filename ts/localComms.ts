import { AskCallback, CommChannel, MessageCallback } from "./comms";

export class LocalCommChannel implements CommChannel {
  callbacks: Map<string, MessageCallback> = new Map<string, MessageCallback>();
  agents: Map<string, AskCallback> = new Map<string, AskCallback>();
  constructor() { }

  sendMessage(from: string, message: string): void {
    console.log(`===== sendMessage ${message} =====`)
    // We use a timeout to cause execution order to be similar to 
    // how it would be if there were a network.
    setTimeout(() => {
      for (const [id, callback] of this.callbacks) {
        if (id !== from) {
          callback(message);
        }
      }
    }, 0);
  }

  addListener(to: string, callback: MessageCallback): void {
    this.callbacks.set(to, callback);
  }

  addReply(name: string, callback: AskCallback): void {
    this.agents.set(name, callback);
  }

  ask(from: string, to: string, message: string): Promise<string> {
    console.log(`===== ask ${from} ${to} ${message} =====`);
    if (this.agents.has(to)) {
      return this.agents.get(to)(from, message);
    }
    else return new Promise((resolve, reject) => {
      reject(`No such agent: ${to}`);
    })
  }
}