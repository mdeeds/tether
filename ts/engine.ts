var frameNumber = 0;

function render(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D) {
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(canvas.width / 600, canvas.height / 400);
  ctx.translate(300, 200);

  ctx.strokeStyle = 'purple';
  ctx.lineWidth = 25;
  ctx.beginPath();
  ctx.arc(0, 0, 50, frameNumber / 10, frameNumber / 10 + 1);
  ctx.stroke();

  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.arc(
    frameNumber * 10 % 600 - 300, frameNumber * 9 % 400 - 200, 25,
    -Math.PI, Math.PI);
  ctx.stroke();

  ++frameNumber;
  requestAnimationFrame(() => { render(canvas, ctx); });
}

onmessage = function (evt) {
  console.log('Message!');
  const canvas = evt.data['canvas'];
  console.log(canvas);
  const ctx = canvas.getContext("2d");
  render(canvas, ctx);
};

if (typeof document === 'undefined') {
  console.log('Engine!');
}
