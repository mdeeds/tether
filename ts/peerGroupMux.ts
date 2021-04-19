import { CallbackFn, PeerGroupInterface } from "./peerGroupInterface";

class PeerGroupChannel implements PeerGroupInterface {
  private channelName: string;
  private base: PeerGroupInterface;
  private namedCallbacks: Map<string, CallbackFn> =
    new Map<string, CallbackFn>();
  private anonymousCallbacks: CallbackFn[] = [];

  constructor(channelName: string, base: PeerGroupInterface) {
    this.channelName = channelName;
    this.base = base;
    this.base.addCallback(`#${this.channelName}#`,
      (fromId: string, data: string) => {
        this.handleData(fromId, data);
      });
  }

  private handleData(fromId: string, data: string) {
    const match = data.match(/^([^:]+):(.*)$/);
    if (match) {
      const name = match[1];
      const message = match[2];
      if (this.namedCallbacks.has(name)) {
        const fn = this.namedCallbacks.get(name);
        fn(fromId, message);
        return;
      }
    }
    for (const cb of this.anonymousCallbacks) {
      cb(fromId, data);
    }
  }

  /**
   * 
   * @param message Message to send to all listeners
   */
  broadcast(message: string): void {
    this.base.broadcast(`#${this.channelName}#:${message}`);
  }

  /**
   * 
   * @param toId Intended recipient
   * @param message Message to send
   */
  send(toId: string, message: string): void {
    this.base.send(toId, `#${this.channelName}#:${message}`);
  }

  /**
   * 
   * @param name Trigger callback on this named message
   * @param f Callback function
   */
  addCallback(name: string, f: CallbackFn): void {
    this.namedCallbacks.set(name, f);
  }

  /**
   * If no named callback matches, these listeners are called.
   * @param f Callback function
   */
  addListener(f: CallbackFn): void {
    this.anonymousCallbacks.push(f);
  }

  /**
   * Underlying ID of data conneciton.
   */
  getId(): Promise<string> {
    return this.base.getId();
  }
}

export class PeerGroupMux {
  private channels: Map<string, PeerGroupInterface> = new Map<string, PeerGroupInterface>();
  private base: PeerGroupInterface;
  constructor(base: PeerGroupInterface) {
    this.base = base;
  }

  get(name: string): PeerGroupInterface {
    if (this.channels.has(name)) {
      return this.channels.get(name);
    }
    const channel = new PeerGroupChannel(name, this.base);
    this.channels.set(name, channel);
    return channel;
  }
}