import { LockedText } from "./lockedText";
import { PeerGroupInterface } from "./peerGroupInterface";
import beautify from "js-beautify";

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
      this.handleUpdate();
    });

    this.div.addEventListener('drop', async (ev) => {
      const oldOffset = this.div.selectionStart;
      await this.handleUpdate();
      setTimeout(() => {
        this.div.value = beautify(this.div.value, {
          "indent_size": 2,
          "indent_char": " ",
          "max_preserve_newlines": 1,
          "preserve_newlines": true,
          "keep_array_indentation": false,
          "break_chained_methods": false,
          "brace_style": "collapse",
          "space_before_conditional": true,
          "unescape_strings": false,
          "jslint_happy": false,
          "end_with_newline": false,
          "wrap_line_length": 80,
          "comma_first": false,
          "e4x": false,
          "indent_empty_lines": false
        });
        this.div.selectionStart = oldOffset;
        this.div.selectionEnd = oldOffset;
        this.handleUpdate();
      }, 0);
    });

    this.lockedText.addUpdateCallback((text: string) => {
      this.setText(text);
    });
  }

  private setText(text: string) {
    const oldOffset = this.div.selectionStart;
    this.div.value = text;
    this.div.selectionStart = oldOffset;
    this.div.selectionEnd = oldOffset;
  }

  private async handleUpdate(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.lastContent != this.div.value) {
        if (!this.lockedText.hasLock()) {
          this.div.selectionStart--;
          this.setText(
            await this.lockedText.takeLock());
          resolve();
        } else {
          this.lockedText.update(this.div.value);
          resolve();
        }
      }
    });
  }
}