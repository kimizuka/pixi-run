import * as PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
import TimeController from './TimeController';

class Running extends TimeController {
  constructor() {
    super();
  }

  run() {

  }

  tick(current) {
    if (!this.isPlay) {
      return;
    }
  }
}

class Jumping extends TimeController {
  y = 0;
  height = 0;
  isJump = false;

  constructor(height, duration) {
    super();
    this.height = height;
    this.duration = duration;
    this.reset();
  }

  jump() {
    if (this.isJump) {
      return;
    }

    this.isJump = true;
    this.play();
    this.emit('jumpstart');
  }

  tick(current) {
    if (!this.isPlay) {
      return;
    }

    if (!this.isJump) {
      return;
    }

    this.progress = Math.min(1, this.pauseProgress + (current - this.startTime) / this.duration);
    this.y = this.height * Math.min(1, Math.sin(this.progress * Math.PI) * 1.01);

    if (1 <= this.progress) {
      this.reset();
      this.isJump = false;
      this.emit('jumpend');
    }
  }
}

export default class Player extends EventEmitter {
  container = new PIXI.Container();
  sprite;
  width = 0;
  height = 0;
  x = 0;
  y = 0;
  canHit = false;
  diffX = 0;
  isPlay = false;
  running = new Running;
  jumping = new Jumping(200, 800);

  constructor({ texture, width, height }) {
    super();

    this.width = width;
    this.height = height;
    this.sprite = new PIXI.Sprite(texture.texture);

    // const graphics = new PIXI.Graphics();

    // graphics.beginFill(0xFF0000);
    //   graphics.drawRect(0, 0, this.width, this.height);
    // graphics.endFill();
    // this.container.addChild(graphics);

    this.container.pivot.x = this.width / 2;
    this.container.pivot.y = this.height;

    this.container.addChild(this.sprite);

    this.jumping.on('jumpstart', () => {
      this.canHit = true;
    });

    this.jumping.on('jumpend', () => {
      this.canHit = false;
    });

    this.reset();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  reset() {
    this.running.reset();
    this.jumping.reset();
  }

  pause() {
    this.isPlay = false;
    this.running.pause();
    this.jumping.pause();
  }

  play() {
    this.isPlay = true;
    this.running.play();
    this.jumping.play();
  }

  run() {
    this.running.run();
  }

  hit(item) {
    this.canHit = false;
    this.emit('hit', item);
  }

  getHitList() {
    return {
      x: {
        min: this.x + this.diffX - this.width / 2,
        max: this.x + this.diffX + this.width / 2,
      },
      y: {
        min: this.y - this.jumping.y - this.height,
        max: this.y - this.jumping.y,
      }
    }
  }

  jump() {
    this.jumping.jump();
  }

  tick(current) {
    this.container.x = this.x + this.diffX;
    this.container.y = this.y - this.jumping.y;

    if (!this.isPlay) {
      return;
    }

    this.running.tick(current);
    this.jumping.tick(current);
  }
}