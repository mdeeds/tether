import { LockedText } from "./lockedText";
import { PeerGroupInterface } from "./peerGroupInterface";

export class SharedBox {
  private lockedText: LockedText;
  readonly div: HTMLTextAreaElement;
  private lastContent: string;

  constructor(peerGroup: PeerGroupInterface,
    container: HTMLDivElement | HTMLBodyElement) {
    this.lockedText = new LockedText(peerGroup);
    this.div = document.createElement('textarea');
    this.div.classList.add('testBox');
    this.div.contentEditable = 'true';
    this.div.spellcheck = false;
    container.appendChild(this.div);

    this.div.addEventListener('keyup', async (ev: KeyboardEvent) => {
      if (this.lastContent != this.div.value) {
        if (!this.lockedText.hasLock()) {
          this.div.value =
            await this.lockedText.takeLock();
        } else {
          this.lockedText.update(this.div.value);
        }
      }
    });

    this.lockedText.addUpdateCallback((text: string) => {
      const oldOffset = this.div.selectionEnd;
      this.div.value = text;
      this.div.selectionStart = oldOffset;
      this.div.selectionEnd = oldOffset;
    });
  }

}