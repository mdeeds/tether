import { LockedText } from "./lockedText";
import { Log } from "./log";
import { PeerGroupInterface } from "./peerGroupInterface";
import { PeerGroupMux } from "./peerGroupMux";
import { SceneInfo } from "./sceneInfo";
import { Shadow } from "./shadow";
import { SharedBox } from "./sharedBox";

export class Scene {
  private mux: PeerGroupMux;
  private box: SharedBox;
  private baseComms: PeerGroupInterface;

  // Common name used by all scenes.
  private joinName: string;
  private sceneInfoText: LockedText;
  private sceneInfo: SceneInfo;

  constructor(baseComms: PeerGroupInterface,
    joinName: string, sceneName: string,
    container: HTMLBodyElement | HTMLDivElement) {
    this.mux = new PeerGroupMux(baseComms);

    const sceneInfoChannel = this.mux.get(joinName);
    this.sceneInfoText = new LockedText(sceneInfoChannel);

    this.sceneInfo = new SceneInfo();
    this.sceneInfo.textChannels.push('A');
    const shadowChannel = `Shadow@${sceneName}`;
    this.sceneInfo.shadowChannels.push(shadowChannel);

    this.sceneInfoText.addUpdateCallback((newValue: string) => {
      this.handleUpdateSceneInfo(newValue);
    });

    this.box = new SharedBox(this.mux.get('A'), container);
    this.baseComms = baseComms;
    const hostShadow = new Shadow({
      x: 30, y: 30, ownerId: baseComms.getId(), tabId: 'A',
      hue: Math.random()
    }, this.box.div, this.mux.get(shadowChannel));
    this.box.div.addEventListener('mousemove', (ev: MouseEvent) => {
      hostShadow.moveToClientXY(ev.clientX, ev.clientY);
    });
    this.pushUpdateSceneInfo();
  }

  /**
   * 
   * @param newValue Latest value from the outside.
   */
  async handleUpdateSceneInfo(newValue: string) {
    const previousValue = JSON.stringify(this.sceneInfo);
    this.sceneInfo.mergeFrom(newValue);
    const mergedValue = JSON.stringify(this.sceneInfo);
    if (mergedValue != newValue) {
      const lockedValue = await this.sceneInfoText.takeLock();
      // This is getting complicated, but maybe this is the best.
      if (lockedValue != newValue) {
        console.error("Too many changes!");
        setTimeout(() => { this.pushUpdateSceneInfo(); },
          Math.random() * 500);
      }
      this.sceneInfoText.update(mergedValue);
    }
  }

  /**
   * Pushes current scene info to the world.
   */
  async pushUpdateSceneInfo() {
    if (this.sceneInfoText.hasLock()) {
      this.sceneInfoText.update(JSON.stringify(this.sceneInfo));
    } else {
      const newValue = await this.sceneInfoText.takeLock();
      this.handleUpdateSceneInfo(newValue);
    }
  }
}