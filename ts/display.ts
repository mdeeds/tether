export class Display {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(container: HTMLDivElement | HTMLBodyElement) {
    const outer = document.createElement('div');
    outer.classList.add('displayOuter')
    container.appendChild(outer);
    const inner = document.createElement('div');
    inner.classList.add('displayInner');
    outer.appendChild(inner);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 120;
    this.canvas.height = 80;
    inner.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.setCanvasSize();

    this.canvas.addEventListener('click', (ev: MouseEvent) => {
      outer.classList.toggle('large');
      this.setCanvasSize();
    });
    this.render();
  }

  private setCanvasSize() {
    const parentBB = this.canvas.parentElement.parentElement.getBoundingClientRect();
    this.canvas.width = parentBB.width;
    this.canvas.height = parentBB.height;
  }

  private frameNumber = 0;
  private render() {
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(this.canvas.width / 600, this.canvas.height / 400);
    this.ctx.translate(300, 200);

    this.ctx.strokeStyle = 'purple';
    this.ctx.lineWidth = 25;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 50,
      this.frameNumber / 10, this.frameNumber / 10 + 1);
    this.ctx.stroke();
    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.arc(
      this.frameNumber * 10 % 600 - 300, this.frameNumber * 9 % 400 - 200, 25,
      -Math.PI, Math.PI);
    this.ctx.stroke();

    ++this.frameNumber;
    requestAnimationFrame(() => { this.render(); });
  }
}