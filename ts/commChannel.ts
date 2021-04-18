import { AskCallback, CommChannelInterface, MessageCallback } from "./commChannelInterface";
import { PeerGroup } from "./peerGroup";
import { PeerInterface } from "./peerInterface";

export class CommChannel implements CommChannelInterface {
  private readonly peerGroup: PeerGroup;
  private id: string;
  private listenCallbacks: MessageCallback[] = [];
  private askCallbacks: Map<string, AskCallback> = new Map<string, AskCallback>();
  private replyCallbacks: AskCallback[] = [];

  private constructor(peerGroup: PeerGroup) {
    this.peerGroup = peerGroup;
    this.peerGroup.addCallback('answer', (data: string) => {
      const match = data.match(/([0-9]+):(.*)/);
      if (match) {
        const askId = match[1];
        if (this.askCallbacks.has(askId)) {
          this.askCallbacks.get(askId)(match[2]);
          this.askCallbacks.delete(askId);
        }
      }
    });
    this.peerGroup.addCallback('ask', async (data: string) => {
      const match = data.match(/([0-9]+):(.*)/);
      if (match) {
        for (const cb of this.replyCallbacks) {
          try {
            const answer = await cb(match[2]);
            const id = match[1];
            this.peerGroup.send('????', `answer:${id}:${answer}`);
            break;
          } catch (ex) {
            continue;
          }
        }
      }
    });
    // this.peerGroup.addListener((data: string) => {
    //     for (const cb of this.listenCallbacks) {
    //       cb(data)
    //     }
    // });
  }

  static async make(conn: PeerInterface, joinId: string): Promise<CommChannel> {
    const peerGroup = await PeerGroup.make(conn, joinId)
    const result: CommChannel = new CommChannel(peerGroup);
    result.id = await peerGroup.getId();
    return new Promise((resolve, reject) => { resolve(result); });
  }

  sendMessage(message: string): void {
    console.log(`===== sendMessage ${message} =====`)
    this.peerGroup.broadcast(message);
  }

  addListener(callback: MessageCallback): void {
    // TODO: these are not wired up.  peerGroup probably needs to implement
    // a non-named callback.
    this.listenCallbacks.push(callback);
  }

  addReply(callback: AskCallback): void {
    this.replyCallbacks.push(callback);
  }

  static askId: number = 0;
  ask(to: string, message: string): Promise<string> {
    console.log(`===== ask ${this.id} ${to} ${message} =====`);
    const askId = CommChannel.askId;
    ++CommChannel.askId;
    this.peerGroup.send(to, `ask:${askId}:${message}`);
    return new Promise((resolve, reject) => {
      this.askCallbacks.set(`${askId}`, resolve as AskCallback);
    });
  }
}