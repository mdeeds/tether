import { AskCallback, CommChannelInterface, MessageCallback } from "./commChannelInterface";

class SubChannel implements CommChannelInterface {
  private channelName: string;
  private baseChannel: CommChannelInterface;
  constructor(name: string, baseChannel: CommChannelInterface) {
    this.channelName = name;
    this.baseChannel = baseChannel;
  }

  sendMessage(message: string): void {
    this.baseChannel.sendMessage(`${this.channelName}:${message}`);
  }

  addListener(callback: MessageCallback): void {
    this.baseChannel.addListener((fromId: string, message: string) => {
      const kvMatch = message.match(/([^:]+):(.*)/);
      if (kvMatch && kvMatch[1] === this.channelName) {
        callback(fromId, kvMatch[2]);
      } else {
      }
    });
  }

  addReply(callback: AskCallback): void {
    this.baseChannel.addReply((fromId: string, message: string) => {
      const kvMatch = message.match(/([^:]+):(.*)/);
      if (kvMatch && kvMatch[1] === this.channelName) {
        return callback(fromId, kvMatch[2]);
      } else return new Promise((resolve, reject) => {
        reject(`I am ${this.channelName}, not ${kvMatch[1]}`);
      });
    });
  }

  ask(to: string, message: string): Promise<string> {
    return this.baseChannel.ask(to, `${this.channelName}:${message}`);
  }
}

export class CommGroup {
  private channels: Map<string, CommChannelInterface> =
    new Map<string, CommChannelInterface>();
  private baseChannel: CommChannelInterface;

  constructor(baseChannel: CommChannelInterface) {
    this.baseChannel = baseChannel;
  }

  getOrCreate(name: string): CommChannelInterface {
    if (!this.channels.has(name)) {
      const comm = new SubChannel(name, this.baseChannel);
      this.channels.set(name, comm);
    }
    return this.channels.get(name);
  }
}