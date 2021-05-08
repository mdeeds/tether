import { PeerGroupInterface } from "./peerGroupInterface";
import { ShadowPosition } from "./shadowPosition";

export class Shadow {
  private position: ShadowPosition;
  private div: HTMLDivElement;
  private textArea: HTMLDivElement;
  private comms: PeerGroupInterface;

  private static shadowNumber: number = 0;

  constructor(position: ShadowPosition, container: HTMLDivElement,
    comms: PeerGroupInterface) {
    this.position = position;
    this.textArea = container;
    this.comms = comms;

    comms.addCallback('position', (fromId: string, data: string) => {
      this.div.style.setProperty(
        'filter', `saturate(120%) hue-rotate(${this.position.hue}turn)`);
      Object.assign(this.position, JSON.parse(data));
      this.internalMoveTo(this.position.x, this.position.y);
    });

    this.div = document.createElement('div');
    this.div.id = `Shadow#${Shadow.shadowNumber++}`;
    this.div.classList.add("shadow");
    this.div.style.setProperty(
      'filter', `saturate(120%) hue-rotate(${this.position.hue}turn)`);
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.div);
    this.moveTo(position.x, position.y)
  }

  setTab(tabId: string) {
    this.position.tabId = tabId;
  }

  // setCurrentTab(tabId: string, textArea: HTMLTextAreaElement) {
  //   if (tabId === this.position.tabId) {
  //     this.img.hidden = false;
  //   } else {
  //     this.img.hidden = true;
  //   }
  //   console.log(`AAAAA: setting text area: ${!!textArea}`);
  //   this.textArea = textArea;
  // }

  moveToClientXY(clientX: number, clientY: number) {
    const divBB = this.textArea.getBoundingClientRect();
    const x = clientX - divBB.left;
    const y = clientY - divBB.top;
    this.moveTo(x, y);
  }

  moveTo(x: number, y: number) {
    this.internalMoveTo(x, y);
    this.comms.broadcast('position', JSON.stringify(this.position));
  }

  private internalMoveTo(x: number, y: number) {
    const scrollOffset = this.textArea.scrollTop;
    this.position.x = x;
    this.position.y = y;
    const divBB = this.textArea.getBoundingClientRect();
    const shadowBB = this.div.getBoundingClientRect();
    const r = shadowBB.width / 2;
    this.div.style.left = `${x - r + divBB.left}px`;
    this.div.style.top = `${y - scrollOffset - r + divBB.top}px`;
  }

  render() {
    this.moveTo(this.position.x, this.position.y);
  }
}