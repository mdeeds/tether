import { Debounce } from "./debounce";
import { Log } from "./log";
import { PeerGroupInterface } from "./peerGroupInterface";

export type UpdateCallbackFn = (text: string) => void;

export class LockedText {
  readonly myId: string;
  private readonly peerGroup: PeerGroupInterface;
  private currentOwnerId: string = null;
  private text: string = "";
  private updateCallbacks: UpdateCallbackFn[] = [];
  private updateDebounce = new Debounce(1000);

  constructor(comms: PeerGroupInterface, initialValue: string = null) {
    this.myId = comms.getId();
    this.peerGroup = comms;
    if (initialValue) {
      this.text = initialValue;
      this.currentOwnerId = comms.getId();
    }

    this.peerGroup.addCallback('owner', (fromId: string, message: string) => {
      this.currentOwnerId = message;
    });

    this.peerGroup.addCallback('update', (fromId: string, message: string) => {
      Log.debug(`(${this.myId}) recieved update: ${message}`);
      if (this.myId !== this.currentOwnerId) {
        this.text = message;
        for (const cb of this.updateCallbacks) {
          cb(this.text);
        }
      }
    });

    this.peerGroup.addAnswer('take',
      (fromId: string, message: string) => {
        Log.debug(
          `(${this.myId}) Current: ${this.currentOwnerId}; new: ${fromId}`);
        this.currentOwnerId = fromId;
        return this.text;
      });

    this.peerGroup.addAnswer('get',
      (fromId: string, message: string) => {
        return `${this.currentOwnerId}@${this.text}`;
      });

    this.peerGroup.addMeetCallback(async (newId: string) => {
      const data = await this.peerGroup.ask(newId, 'get:please');
      const match = data.match(/([^@]+)@([/S/s]*)/);
      if (match[1] != 'null') {
        this.currentOwnerId = match[1];
        this.text = match[2];
      }
    });
  }

  addUpdateCallback(f: UpdateCallbackFn) {
    this.updateCallbacks.push(f);
  }

  hasLock(): boolean {
    Log.debug(`Current owner: ${this.currentOwnerId}; I am ${this.myId}`);
    return this.currentOwnerId === this.myId;
  }

  async takeLock(): Promise<string> {
    if (this.currentOwnerId && this.currentOwnerId != this.myId) {
      Log.debug(`Take issued from ${this.myId} ` +
        `to ${this.currentOwnerId}`);
      const reply = await this.peerGroup.ask(
        this.currentOwnerId, 'take:please');
      Log.debug(`Take resolved; new value: ${reply}`);
      this.text = reply;
      this.currentOwnerId = this.myId;
    } else {
      Log.debug(`Take Already owner: ${this.currentOwnerId}`);
      this.currentOwnerId = this.myId;
    }
    Log.debug(`Take new owner: ${this.myId}`);
    this.peerGroup.broadcast('owner', this.myId);
    return new Promise((resolve, reject) => { resolve(this.text); });
  }

  /** 
   * 
   * @param text New value
   * @returns true if update is successful.  Update will fail if 
   * client no longer holds the lock.
   */
  update(text: string): boolean {
    if (text === this.text) {
      return true;
    }
    Log.debug(`(${this.myId}) update(${text}) ` +
      `Current: ${this.currentOwnerId}; new: ${this.myId}`);
    if (this.currentOwnerId === this.myId || this.currentOwnerId === null) {
      this.currentOwnerId = this.myId;
      this.text = text;
      this.updateDebounce.go(() => {
        this.peerGroup.broadcast('update', text);
      });
      return true;
    }
    return false;
  }

  get(): string {
    return this.text;
  }
}