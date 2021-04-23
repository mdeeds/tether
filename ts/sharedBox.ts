import { LockedText } from "./lockedText";
import { PeerGroupInterface } from "./peerGroupInterface";

export class SharedBox {
  private lockedText: LockedText;
  private div: HTMLDivElement;
  private lastContent: string;
  constructor(peerGroup: PeerGroupInterface,
    container: HTMLDivElement | HTMLBodyElement) {
    this.lockedText = new LockedText(peerGroup.getId(), peerGroup);
    this.div = document.createElement('div');
    this.div.classList.add('testBox');
    this.div.contentEditable = 'true';
    this.div.spellcheck = false;
    container.appendChild(this.div);

    this.div.addEventListener('keyup', async (ev: KeyboardEvent) => {
      if (this.lastContent != this.div.innerText) {
        if (!this.lockedText.hasLock()) {
          this.div.innerText =
            await this.lockedText.takeLock();
        } else {
          this.lockedText.update(this.div.innerText);
        }
      }
    });

    this.lockedText.addUpdateCallback((text: string) => {
      this.div.innerText = text;
    });
  }

}