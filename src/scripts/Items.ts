import * as PIXI from 'pixi.js';
import TimeController from './TimeController';

class Item {
  container = new PIXI.Container();
  sprite;
  x = 0;
  y = 0;
  size = 0;

  constructor({ x, y, size }) {
    const graphics = new PIXI.Graphics();

    this.x = x;
    this.y = y;
    this.size = size;

    graphics.beginFill(0x0000FF);
      graphics.drawRect(this.x, this.y, this.size, this.size);
    graphics.endFill();

    this.container.addChild(graphics);
  }

  setBottom(y) {
    this.container.y = y;
  }

  setWidth(width) {
    this.sprite.width = width;
  }

  tick(progress: number) {
    console.log(progress);
  }
}

export default class Items extends TimeController {
  container = new PIXI.Container();
  list:Item[] = [];
  hitList = [];
  length = 0;
  duration = 0;
  startTime = 0;;
  width = window.innerWidth * 3;
  y = 0;

  constructor(length) {
    super();
    this.length = length;

    for (let i = 0; i < length; ++i) {
      this.list.push(new Item({
        x: window.innerWidth * 3,
        y: 100,
        size: 40
      }));
      this.container.addChild(this.list[i].container);
    }

    this.reset();
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setTop(y) {
    this.container.y = this.y = y;
  }

  getHitItem() {
    this.list.forEach((item, i) => {
      this.hitList[i] = {
        x: {
          min: this.container.x + item.x,
          max: this.container.x + item.x + item.size,
        },
        y: {
          min: this.container.y + item.y,
          max: this.container.y + item.y + item.size,
        },
        item
      };
    });

    return this.hitList;
  }

  tick(current: number) {
    if (!this.isPlay) {
      return;
    }

    this.progress = this.pauseProgress + (current - this.startTime) / this.duration;

    if (1 <= this.progress) {
      this.progress %= 1;
    }

    this.container.x = -this.width * this.progress;
  }
}