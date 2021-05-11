if (typeof document === 'undefined') {
  const offscreen = new OffscreenCanvas(600, 400);
  const ctx = offscreen.getContext('2d');
  ctx.fillStyle = 'blue';
  ctx.fillRect(20, 20, 650, 360);

  console.log('Engine!');

  requestAnimationFrame(() => {
    const bitmap = offscreen.transferToImageBitmap();
    postMessage({ bitmap: bitmap }, null, [bitmap]);
  });
}
