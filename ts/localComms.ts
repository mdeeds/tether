import { rejects } from "assert";
import { AskCallback, CommChannel, MessageCallback } from "./commChannel";

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
          console.log(`===== ${message} to ${id} =====`)
          callback(message);
        }
      }
    }, 0);
  }

  addListener(to: string, callback: MessageCallback): void {
    if (this.callbacks.has(to)) {
      const previousCallback = this.callbacks.get(to);
      // Chain
      this.callbacks.set(to, (message) => {
        previousCallback(message);
        callback(message);
      })
    } else {
      this.callbacks.set(to, callback);
    }
  }

  addReply(name: string, callback: AskCallback): void {
    if (this.agents.has(name)) {
      const previousCallback = this.agents.get(name);
      // Chain the new callback before the first callback.
      // If the new callback fails, we process the previous one.
      this.agents.set(name, (from: string, message: string) => {
        return new Promise((resolve, reject) => {
          callback(from, message)
            .then((response: string) => {
              resolve(response);
            })
            .catch(() => {
              return previousCallback(from, message);
            });
        });
      });
    } else {
      this.agents.set(name, callback);
    }
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