import { CommChannel } from "./commChannel";
import { LocalCommChannel } from "./localComms";

export class CommGroup {
  private channels: Map<string, CommChannel> = new Map<string, CommChannel>();
  private factory: (name: string) => CommChannel;
  constructor(commFactory: (name: string) => CommChannel) {
    this.factory = commFactory;
  }

  getOrCreate(name: string): CommChannel {
    if (!this.channels.has(name)) {
      const comm = this.factory(name);
      this.channels.set(name, comm);
    }
    return this.channels.get(name);
  }

  static localCommGroup() {
    return new CommGroup((name: string) => {
      return new LocalCommChannel();
    });
  }
}