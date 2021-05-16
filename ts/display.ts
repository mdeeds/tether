import { runInThisContext } from "vm";
import { BitmapCache } from "./bitmapCache";
import { StorageUtil } from "./storageUtil";

export class Display {
  private canvas: HTMLCanvasElement;
  private ctx: ImageBitmapRenderingContext;
  private worker: Worker;

  constructor(container: HTMLDivElement | HTMLBodyElement) {
    const outer = document.createElement('div');
    outer.classList.add('displayOuter')
    outer.classList.add('large');
    container.appendChild(outer);
    const inner = document.createElement('div');
    inner.classList.add('displayInner');
    outer.appendChild(inner);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 400;
    inner.appendChild(this.canvas);
    // this.setCanvasSize();
    this.canvas.addEventListener('click', (ev: MouseEvent) => {
      outer.classList.toggle('large');
      this.setCanvasSize();
    });
    this.updateCode("");
  }

  resetCanvas(): OffscreenCanvas {
    // TODO: create a new canvas element.
    return this.canvas.transferControlToOffscreen();
  }

  async updateCode(code: string) {
    const engineCode: string = await StorageUtil.get('engine.js');
    console.log(`Engine bytes: ${engineCode.length}`);
    const fullSource = `${engineCode}\n${code}`;
    const dataUrl = `data:text/html;base64,${btoa(fullSource)}`;
    if (this.worker) {
      this.worker.terminate();
    }
    this.worker = new Worker(dataUrl);
    let offscreen = this.resetCanvas();
    this.worker.postMessage({ canvas: offscreen }, [offscreen]);
    this.worker.addEventListener('message', async (ev) => {
      switch (ev.data['command']) {
        case 'getBitmap':
          const uri: string = ev.data['uri'];
          const bitmap = await BitmapCache.get(ev.data['uri']);
          this.worker.postMessage({
            bitmap: bitmap,
            uri: uri
          }, [bitmap]);
          break;
      }
    });
  }

  private setCanvasSize() {
    const parentBB = this.canvas.parentElement.parentElement.getBoundingClientRect();
    this.canvas.style.setProperty('width', `${parentBB.width}px`)
    this.canvas.style.setProperty('height', `${parentBB.height}px`)
  }
}