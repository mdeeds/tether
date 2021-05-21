var frameNumber = 0;

function render(canvas, ctx) {
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(canvas.width / 600, canvas.height / 400);
  ctx.translate(300, 200);

  for (const s of registeredSprites) {
    s.render(ctx);
  }
  ++frameNumber;
  requestAnimationFrame(() => { render(canvas, ctx); });
}

onmessage = function (evt) {
  if (evt.data['canvas']) {
    const canvas = evt.data['canvas'];
    const ctx = canvas.getContext("2d");
    render(canvas, ctx);
  }
  if (evt.data['bitmap']) {
    bitmapWorkerSet(evt.data['uri'], evt.data['bitmap']);
  }
};

var bitmapWorkerCache = new Map();
var bitmapWorkerCallbacks = new Map();

bitmapWorkerGet = function (uri) {
  if (bitmapWorkerCache.has(uri)) {
    return new Promise((resolve, reject) => {
      resolve(bitmapWorkerCache.get(uri));
    })
  }
  return new Promise((resolve, reject) => {
    if (!bitmapWorkerCallbacks.has(uri)) {
      bitmapWorkerCallbacks.set(uri, []);
    }
    bitmapWorkerCallbacks.get(uri).push(resolve);
    postMessage({ command: 'getBitmap', uri: uri }, null);
  });
}

bitmapWorkerSet = function (uri, bitmap) {
  bitmapWorkerCache.set(uri, bitmap);
  for (const cb of bitmapWorkerCallbacks.get(uri)) {
    cb(bitmap);
  }
}

var registeredSprites = new Set();

class Sprite {
  make(dict) {
    const s = new Sprite();
    if (dict) {
      Object.assign(s, dict);
    }
    registeredSprites.add(s);
    s.whenStarted();
    return s;
  }

  constructor() {
    this.x = 0;
    this.y = 0;
    this.costume = null;
    this.setCostume('img/Blue Ghost.png');
    registeredSprites.add(this);
  }

  whenStarted() { }

  onEveryFrame() { }

  async setCostume(uri) {
    this.costume = await bitmapWorkerGet(uri);
  }

  render(ctx) {
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

  deleteThisClone() {
    registeredSprites.delete(this);
  }

  clone() {
    const s = Sprite.make(this);
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  changeXBy(dx) {
    this.x += dx;
  }

  changeYBy(dy) {
    this.y += dy;
  }
}
