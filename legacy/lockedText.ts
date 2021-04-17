import { CommChannelInterface } from "./commChannelInterface";

export class LockedText {
  readonly myId: string;
  private readonly comms: CommChannelInterface;
  private currentOwnerId: string = null;
  private text: string;
  constructor(myId: string, comms: CommChannelInterface) {
    this.myId = myId;
    this.comms = comms;
    this.comms.addListener(myId,
      (message: string) => { this.listen(message); });
    this.comms.addReply(myId,
      (from: string, message: string) => { return this.reply(from, message); });
  }

  /**
   * Broadcast messages:
   *   owner:${id}
   *   update:${message}
   * @param message 
   */
  private listen(message: string) {
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

  private reply(from: string, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (message === 'take') {
        this.currentOwnerId = from;
        resolve(this.text);
      } else {
        reject(`Don't know how to reply to ${message} from ${from}.`);
      }
    });
  }

  async takeLock(): Promise<void> {
    if (this.currentOwnerId && this.currentOwnerId != this.myId) {
      const reply = await this.comms.ask(this.myId, this.currentOwnerId, 'take');
      this.text = reply;
      this.currentOwnerId = this.myId;
    } else {
      this.currentOwnerId = this.myId;
    }
    this.comms.sendMessage(this.myId, `owner:${this.myId}`);
  }

  /** 
   * 
   * @param text New value
   * @param key Secret key
   * @returns true if update is successful.  Update will fail if 
   * client no longer holds the right Secret.
   */
  update(text: string): boolean {
    if (this.currentOwnerId === this.myId) {
      this.text = text;
      this.comms.sendMessage(this.myId, `update:${text}`);
      return true;
    }
    return false;
  }

  get(): string {
    return this.text;
  }

}