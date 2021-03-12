import * as PIXI from 'pixi.js';
import TimeController from './TimeController';

class Layer {
  container = new PIXI.Container();
  sprite;
  width = 0;
  height = 0;
  y = 0;

  constructor({ texture }, width, height) {
    this.sprite = new PIXI.TilingSprite(
      texture,
      width,
      height
    );
    this.width = width;
    this.height = height
    this.container.pivot.y = this.sprite.height;
    this.container.addChild(this.sprite);
  }

  setBottom(y) {
    this.container.y = this.y = y;
  }

  setWidth(width) {
    this.sprite.width = width;
  }

  tick(progress: number) {
    this.sprite.tilePosition.x = -this.width * progress;
  }
}

export default class Bg extends TimeController {
  container = new PIXI.Container();
  layers:Layer[] = [];
  length = 0;
  duration = 0;
  startTime = 0;
  width = 0;
  height = 0;
  y = 0;

  constructor(textures) {
    super();
    this.length = textures.length;

    for (let i = 0; i < this.length; ++i) {
      const { texture, width, height } = textures[i];
      this.layers.push(new Layer(
        texture,
        width,
        height
      ));

      this.container.addChild(this.layers[i].container);
    }

    this.reset();
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setBottom(y) {
    this.y = y;

    this.layers.forEach((layer) => {
      layer.setBottom(this.y);
    });
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;

    this.layers.forEach((layer) => {
      layer.setWidth(this.width);
    });
  }

  tick(current: number) {
    if (!this.isPlay) {
      return;
    }

    this.progress = this.pauseProgress + (current - this.startTime) / this.duration;

    if (1 <= this.progress) {
      this.progress %= 1;
    }

    this.layers.forEach((layer) => {
      layer.tick(this.progress);
    });
  }
}