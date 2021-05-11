import { runInThisContext } from "vm";

export class Display {
  private canvas: HTMLCanvasElement;
  private ctx: ImageBitmapRenderingContext;
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
    let offscreen = this.canvas.transferControlToOffscreen();
    const w = new Worker('engine.js');
    w.postMessage({ canvas: offscreen }, [offscreen]);
  }

  private setCanvasSize() {
    const parentBB = this.canvas.parentElement.parentElement.getBoundingClientRect();
    this.canvas.style.setProperty('width', `${parentBB.width}px`)
    this.canvas.style.setProperty('height', `${parentBB.height}px`)
  }
}