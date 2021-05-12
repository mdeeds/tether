export class Sprite {
  public x: number = 0;
  public y: number = 0;

  private costume: ImageBitmap;

  constructor() {
    // this.costume = document.createElement('img');
    // this.costume.src = 'img/Blue Ghost.png';
    this.whenStarted();
  }

  public whenStarted() { }

  public onEveryFrame() { }

  public setCostume(uri: string) {
    // this.costume.src = uri;
  }

  public render(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    // const x = this.x - this.costume.width / 2;
    // const y = this.y - this.costume.height / 2;
    // ctx.drawImage(this.costume, x, y);
    this.onEveryFrame();
  }
}