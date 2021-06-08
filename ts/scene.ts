import { Display } from "./display";
import { LockedText } from "./lockedText";
import { Log } from "./log";
import { PeerGroupInterface } from "./peerGroupInterface";
import { PeerGroupMux } from "./peerGroupMux";
import { SceneInfo } from "./sceneInfo";
import { Shadow } from "./shadow";
import { ShadowPosition } from "./shadowPosition";
import { SharedBox } from "./sharedBox";
import { Tile } from "./tile";

export class Scene {
  private mux: PeerGroupMux;
  private box: SharedBox;
  private baseComms: PeerGroupInterface;
  private otherShadows: Map<string, Shadow> = new Map<string, Shadow>();
  private display: Display;

  // Common name used by all scenes.
  private sceneInfoText: LockedText;
  private sceneInfo: SceneInfo;

  constructor(baseComms: PeerGroupInterface,
    joinName: string, sceneName: string,
    container: HTMLBodyElement | HTMLDivElement) {
    this.display = new Display(container,
      () => { return this.concatenateCode(); });
    this.mux = new PeerGroupMux(baseComms);

    const sceneInfoChannel = this.mux.get(joinName);
    this.sceneInfoText = new LockedText(sceneInfoChannel);

    this.sceneInfo = new SceneInfo();
    this.sceneInfo.textChannels.push('A');
    const shadowChannel = `Shadow@${sceneName}`;
    this.otherShadows.set(shadowChannel, null);
    this.sceneInfo.shadowChannels.push(shadowChannel);

    this.sceneInfoText.addUpdateCallback((newValue: string) => {
      this.handleUpdateSceneInfo(newValue);
    });

    const tileNameDiv = document.createElement('div');
    tileNameDiv.classList.add('tileName');
    tileNameDiv.innerText = 'A ';
    const newTile = document.createElement('span');
    newTile.classList.add('button');
    newTile.innerHTML = '&#128472;';  // &#8644;
    newTile.addEventListener('click', (ev) => {
      Tile.display(['Foo', 'A', 'Bar']);
    });
    tileNameDiv.appendChild(newTile);
    container.appendChild(tileNameDiv);

    this.box = new SharedBox(this.mux.get('A'), container);
    this.baseComms = baseComms;

    let lastClientX = 0;
    let lastClientY = 0;
    const hostShadow = new Shadow({
      x: 30, y: 30, ownerId: baseComms.getId(), tabId: 'A',
      hue: Math.random()
    }, this.box.div, this.mux.get(shadowChannel));

    this.box.div.addEventListener('mousemove', (ev: MouseEvent) => {
      lastClientX = ev.clientX;
      lastClientY = ev.clientY;
      const x = ev.clientX + this.box.div.scrollLeft;
      const y = ev.clientY + this.box.div.scrollTop;
      hostShadow.moveToClientXY(x, y);
    });
    this.box.div.addEventListener('scroll', (ev) => {
      hostShadow.moveToClientXY(lastClientX + this.box.div.scrollLeft,
        lastClientY + this.box.div.scrollTop);
    });

    this.pushUpdateSceneInfo();
  }

  private concatenateCode(): string {
    return this.box.div.value;
  }

  /**
   * 
   * @param newValue Latest value from the outside.
   */
  async handleUpdateSceneInfo(newValue: string) {
    const previousValue = JSON.stringify(this.sceneInfo);
    this.sceneInfo.mergeFrom(newValue);
    for (const shadowId of this.sceneInfo.shadowChannels) {
      if (!this.otherShadows.has(shadowId)) {
        const shadow = new Shadow(new ShadowPosition(),
          this.box.div, this.mux.get(shadowId));
        this.otherShadows.set(shadowId, shadow);
      }
    }
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