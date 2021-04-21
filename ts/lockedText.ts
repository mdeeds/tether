import { Log } from "./log";
import { PeerGroupInterface } from "./peerGroupInterface";

export class LockedText {
  readonly myId: string;
  private readonly peerGroup: PeerGroupInterface;
  private currentOwnerId: string = null;
  private text: string;
  constructor(myId: string, comms: PeerGroupInterface) {
    this.myId = myId;
    this.peerGroup = comms;
    this.peerGroup.addListener(
      (fromId: string, message: string) => { this.listen(fromId, message); });
    this.peerGroup.addCallback('take',
      (fromId: string, message: string) => {
        Log.debug(`(${this.myId}) Current: ${this.currentOwnerId}; new: ${fromId}`);
        return new Promise((resolve, reject) => {
          this.currentOwnerId = fromId;
          resolve(this.text);
        });
      });
  }

  /**
   * Broadcast messages:
   *   owner:${id}
   *   update:${message}
   * @param message 
   */
  private listen(fromId: string, message: string) {
    Log.debug(`listen(${message})`);
    const kvMatch = message.match(/([^:]+):(.*)/);
    if (!kvMatch) {
      throw new Error(`Unable to parse: ${message}`);
    }
    const value = kvMatch[2];
    switch (kvMatch[1]) {
      case 'owner':
        this.currentOwnerId = value;
        break;

      case 'update':
        if (this.myId !== this.currentOwnerId) {
          this.text = value;
        } else {
          throw new Error('Should not talk to oneself.')
        }
        break;
    }
  }

  async takeLock(): Promise<void> {
    if (this.currentOwnerId && this.currentOwnerId != this.myId) {
      Log.debug(`Take from ${this.currentOwnerId}`);
      const reply = await this.peerGroup.ask(this.currentOwnerId, 'take');
      this.text = reply;
      this.currentOwnerId = this.myId;
    } else {
      Log.debug(`Take Already owner: ${this.currentOwnerId}`);
      this.currentOwnerId = this.myId;
    }
    Log.debug(`Take new owner: ${this.myId}`);
    this.peerGroup.broadcast(`owner:${this.myId}`);
  }

  /** 
   * 
   * @param text New value
   * @returns true if update is successful.  Update will fail if 
   * client no longer holds the right Secret.
   */
  update(text: string): boolean {
    Log.debug(`(${this.myId}) update(${text}) ` +
      `Current: ${this.currentOwnerId}; new: ${this.myId}`);
    if (this.currentOwnerId === this.myId) {
      this.text = text;
      this.peerGroup.broadcast(`update:${text}`);
      return true;
    }
    return false;
  }

  get(): string {
    return this.text;
  }

}