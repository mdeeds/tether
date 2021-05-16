import { BitmapWorker } from "./bitmapWorker";

export class Sprite {
  public x: number = 0;
  public y: number = 0;

  private costume: ImageBitmap = null;

  constructor() {
    this.setCostume('img/Blue Ghost.png');
    this.whenStarted();
  }

  public whenStarted() { }

  public onEveryFrame() { }

  public async setCostume(uri: string) {
    this.costume = await BitmapWorker.get(uri);
  }

  public render(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    if (this.costume === null) {
      ctx.fillStyle = '#0ff';
      ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    } else {
      const x = this.x - this.costume.width / 2;
      const y = this.y - this.costume.height / 2;
      ctx.drawImage(this.costume, x, y);
    }
    this.onEveryFrame();
  }
}