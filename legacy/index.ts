import { LockedText } from "./lockedText";
import { CommChannelInterface } from "./commChannelInterface";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  class Box {
    static async make(joinId: string = null): Promise<Box> {
      const comm = await CommChannel.makeNetwork(joinId);
      const box = new Box(comm);
      return new Promise((resolve, reject) => { resolve(box); });
    }

    private peerComm: CommChannelInterface;
    private div: HTMLDivElement;
    private lastValue: string = "";
    private text: LockedText;

    private constructor(peerComm: CommChannelInterface) {
      this.peerComm = peerComm;
      this.div = document.createElement('div');
      this.div.classList.add('testBox');
      this.div.contentEditable = "true";
      this.div.spellcheck = false;
      body.appendChild(this.div);
      this.text = new LockedText(this.peerComm.getId(), this.peerComm);
      this.text.onChange((newValue: string) => {
        this.div.innerText = newValue;
      });
      this.div.addEventListener('keyup', async (ev: KeyboardEvent) => {
        if (this.div.innerText != this.lastValue) {
          console.log(`Changed keyup: ${ev.key}`);
          this.lastValue = this.div.innerText;
          if (!this.text.hasLock()) {
            await this.text.takeLock();
          }
          this.text.update(this.div.innerText);
        }
      });
    }

    getId(): string {
      return this.peerComm.getId();
    }
  }

  const boxA = await Box.make();
  const boxB = await Box.make(boxA.getId());
}


if (url.searchParams.get('test')) {
  test();
} else {
  const mainArea = document.createElement('div');
  mainArea.id = 'mainArea';
  body.appendChild(mainArea);

  const tabList = document.createElement('div');
  mainArea.appendChild(tabList);

  const tab = document.createElement('span');
  tab.innerText = 'party';
  tab.classList.add('tab');
  tabList.appendChild(tab);

  const editArea = document.createElement('div');
  mainArea.appendChild(editArea);
  editArea.contentEditable = "true";
  editArea.spellcheck = false;
  editArea.id = 'editArea';

  editArea.addEventListener('mousemove', (ev) => {

  });
}