import { AskCallback, CommChannelInterface, MessageCallback } from "./commChannelInterface";
import { PeerGroup } from "./peerGroup";
import { PeerInterface } from "./peerInterface";

type NamedCallbackFn = (data: string) => void;

export class CommChannel implements CommChannelInterface {
  callbacks: Map<string, MessageCallback> = new Map<string, MessageCallback>();
  agents: Map<string, AskCallback> = new Map<string, AskCallback>();
  private namedCallbacks: Map<string, NamedCallbackFn> =
    new Map<string, NamedCallbackFn>();

  private readonly peerGroup: PeerGroup;

  private constructor(peerGroup: PeerGroup) {
    this.peerGroup = peerGroup;
  }

  static async make(conn: PeerInterface, joinId: string) {
    const peerGroup = await PeerGroup.make(conn, joinId)
    const result: CommChannel = new CommChannel(peerGroup);
  }

  sendMessage(message: string): void {
    console.log(`===== sendMessage ${message} =====`)
    this.peerGroup.broadcast(message);
  }

  addListener(to: string, callback: MessageCallback): void {
    // 
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