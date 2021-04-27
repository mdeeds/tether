import { PeerGroupInterface } from "./peerGroupInterface";
import { PeerGroupMux } from "./peerGroupMux";
import { Shadow } from "./shadow";
import { SharedBox } from "./sharedBox";

export class Scene {
  private mux: PeerGroupMux;
  private box: SharedBox;

  constructor(baseComms: PeerGroupInterface,
    container: HTMLBodyElement | HTMLDivElement) {
    this.mux = new PeerGroupMux(baseComms);
    this.box = new SharedBox(this.mux.get('A'), container);
    const hostShadow = new Shadow(
      {
        x: 30, y: 30, ownerId: baseComms.getId(), tabId: 'A',
        hue: Math.random()
      },
      this.box.div, this.mux.get('ShadowHost'));
    this.box.div.addEventListener('mousemove', (ev: MouseEvent) => {
      hostShadow.moveToClientXY(ev.clientX, ev.clientY);
    });
  }
}