import * as PIXI from 'pixi.js';
import TimeController from './TimeController';

class Item {
  container = new PIXI.Container();
  sprite;
  x = 0;
  y = 0;
  size = 0;

  constructor({ texture, x, y, size }) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.sprite = new PIXI.Sprite(texture.texture);
    this.sprite.x = x;
    this.sprite.y = y;

    // const graphics = new PIXI.Graphics();

    // graphics.beginFill(0x0000FF);
    //   graphics.drawRect(this.x, this.y, this.size, this.size);
    // graphics.endFill();

    // this.container.addChild(graphics);
    this.container.addChild(this.sprite);
  }

  setBottom(y) {
    this.container.y = y;
  }

  setWidth(width) {
    this.sprite.width = width;
  }

  tick(progress) {
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

  constructor(items) {
    super();
    this.length = items.length;

    for (let i = 0; i < this.length; ++i) {
      this.list.push(new Item({
        texture: items[i].texture,
        x: items[i].x,
        y: items[i].y,
        size: items[i].size
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

  tick(current) {
    if (!this.isPlay) {
      return;
    }

    this.progress = this.pauseProgress + (current - this.startTime) / this.duration;

    if (1 <= this.progress) {
      this.progress %= 1;
    }

    this.container.x = -this.width * this.progress;
  }

  seek(progress) {
    this.progress = Number(progress);

    this.container.x = -this.width * this.progress;
  }
}