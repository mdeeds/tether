import { BitmapCache } from "./bitmapCache";
import { StorageUtil } from "./storageUtil";

type CodeSource = () => string;

export class Display {
  private canvas: HTMLCanvasElement;
  private outer: HTMLDivElement;
  private inner: HTMLDivElement;
  private worker: Worker;
  private codeSource: CodeSource;

  constructor(container: HTMLDivElement | HTMLBodyElement,
    codeSource: CodeSource) {
    this.codeSource = codeSource;
    this.outer = document.createElement('div');
    this.outer.classList.add('displayOuter')
    container.appendChild(this.outer);
    this.inner = document.createElement('div');
    this.inner.classList.add('displayInner');
    this.outer.appendChild(this.inner);
    this.updateCode("");
  }

  resetCanvas(): OffscreenCanvas {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1200;
    this.canvas.height = 800;
    this.inner.innerHTML = "";
    this.inner.appendChild(this.canvas);
    // this.setCanvasSize();
    this.canvas.addEventListener('click', (ev: MouseEvent) => {
      this.outer.classList.toggle('large');
      this.setCanvasSize();
      if (this.outer.classList.contains('large')) {
        this.updateCode(this.codeSource());
      }
    });
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
    setTimeout(() => {
      const parentBB = this.canvas.parentElement.parentElement.getBoundingClientRect();
      this.canvas.style.setProperty('width', `${parentBB.width}px`)
      this.canvas.style.setProperty('height', `${parentBB.height}px`)
    }, 0);
  }
}