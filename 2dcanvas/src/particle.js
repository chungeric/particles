export class Particle {
  constructor(x, y) {
    this.x = this.px = x;
    this.y = this.py = y;
    this.xv = this.yv = 0;
    this.color = `rgb(
      ${Math.floor(255 * Math.random())},
      ${Math.floor(255 * Math.random())},
      ${Math.floor(255 * Math.random())}
    )`;
  }
}