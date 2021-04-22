import Peer from "peerjs";
import { LockedText } from "./lockedText";
import { PeerGroup } from "./peerGroup";
import { PeerGroupInterface } from "./peerGroupInterface";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  class Box {
    private peerGroup: PeerGroupInterface;
    private lockedText: LockedText;
    private div: HTMLDivElement;
    private lastContent: string;
    constructor(id: string, peerGroup: PeerGroupInterface) {
      this.peerGroup = peerGroup;
      this.lockedText = new LockedText(id, peerGroup);
      this.div = document.createElement('div');
      this.div.classList.add('testBox');
      this.div.contentEditable = 'true';
      this.div.spellcheck = false;
      body.appendChild(this.div);

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

  const host = new Peer();
  const hostGroup = await PeerGroup.make(host);
  const hostBox = new Box(host.id, hostGroup);

  const client = new Peer();
  const clientGroup = await PeerGroup.make(client, host.id);
  const clientBox = new Box(client.id, clientGroup);
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