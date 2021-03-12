import EventEmitter from 'eventemitter3';

export default class TimeController extends EventEmitter {
  duration = 0;
  startTime;
  progress = 0;
  pauseProgress = 0;
  isPlay = false;

  constructor() {
    super();
  }

  reset() {
    this.startTime = Date.now();
    this.progress = 0;
    this.pauseProgress = 0;
    this.isPlay = false;
  }

  play() {
    this.startTime = Date.now();
    this.isPlay = true;
  }

  pause() {
    this.isPlay = false;
    this.pauseProgress = this.progress;
  }
}