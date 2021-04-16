import { AskCallback, CommChannel, MessageCallback } from "./commChannel";
import { LocalCommChannel } from "./localComms";

class SubChannel implements CommChannel {
  private channelName: string;
  private baseChannel: CommChannel;
  constructor(name: string, baseChannel: CommChannel) {
    this.channelName = name;
    this.baseChannel = baseChannel;
  }

  sendMessage(from: string, message: string): void {
    this.baseChannel.sendMessage(from, `${this.channelName}:${message}`);
  }

  addListener(to: string, callback: MessageCallback): void {
    this.baseChannel.addListener(to, (message: string) => {
      const kvMatch = message.match(/([^:]+):(.*)/);
      if (kvMatch && kvMatch[1] === this.channelName) {
        callback(kvMatch[2]);
      } else {
      }
    });
  }
  addReply(to: string, callback: AskCallback): void {
    this.baseChannel.addReply(to, (from: string, message: string) => {
      const kvMatch = message.match(/([^:]+):(.*)/);
      if (kvMatch && kvMatch[1] === this.channelName) {
        return callback(from, kvMatch[2]);
      } else return new Promise((resolve, reject) => {
        reject(`I am ${this.channelName}, not ${kvMatch[1]}`);
      });
    });
  }
  ask(from: string, to: string, message: string): Promise<string> {
    return this.baseChannel.ask(from, to, `${this.channelName}:${message}`);
  }
}

export class CommGroup {
  private channels: Map<string, CommChannel> = new Map<string, CommChannel>();
  private baseChannel: CommChannel;

  constructor(baseChannel: CommChannel) {
    this.baseChannel = baseChannel;
  }

  getOrCreate(name: string): CommChannel {
    if (!this.channels.has(name)) {
      const comm = new SubChannel(name, this.baseChannel);
      this.channels.set(name, comm);
    }
    return this.channels.get(name);
  }

  static localCommGroup() {
    return new CommGroup(new LocalCommChannel());
  }
}