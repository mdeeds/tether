export class Debounce {
  private sendDelayMs: number;
  private lastActionTime: number;
  private previousTimeout = null;
  constructor(sendDelayMs: number) {
    this.sendDelayMs = sendDelayMs;
    this.lastActionTime = window.performance.now();
  }

  go(f: Function) {
    const timeSinceLast = window.performance.now() - this.lastActionTime;
    const remainingDelay = Math.max(0, this.sendDelayMs - timeSinceLast);
    clearTimeout(this.previousTimeout);
    this.previousTimeout = setTimeout(() => {
      this.lastActionTime = window.performance.now();
      f();
    }, remainingDelay);
  }
}