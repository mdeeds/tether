import { PeerGroupInterface } from "./peerGroupInterface";
import { PeerGroupMux } from "./peerGroupMux";
import { Shadow } from "./shadow";
import { SharedBox } from "./sharedBox";

export class Scene {
  private mux: PeerGroupMux;
  private box: SharedBox;
  private baseComms: PeerGroupInterface;

  constructor(baseComms: PeerGroupInterface, sceneName: string,
    container: HTMLBodyElement | HTMLDivElement) {
    this.mux = new PeerGroupMux(baseComms);
    this.box = new SharedBox(this.mux.get('A'), container);
    this.baseComms = baseComms;
    const hostShadow = new Shadow(
      {
        x: 30, y: 30, ownerId: baseComms.getId(), tabId: 'A',
        hue: Math.random()
      },
      this.box.div, this.mux.get(`Shadow@${sceneName}`));
    this.box.div.addEventListener('mousemove', (ev: MouseEvent) => {
      hostShadow.moveToClientXY(ev.clientX, ev.clientY);
    });
    baseComms.addCallback('scene', (fromId: string, message: string) => {
      this.requestSceneInfo(fromId);
    });
    baseComms.addAnswer('info', (fromId: string, message: string) => {
      return this.getSceneInfo(fromId);
    })
    baseComms.broadcast('scene', 'hello');
  }

  requestSceneInfo(fromId: string) {
    console.log(`Requesting info AAAAA`);
    this.baseComms.ask(fromId, 'info:please');
  }

  getSceneInfo(fromId: string) {
    console.log(`getSceneInfo`);
    return "Hello, ${fromId}!";
  }

}