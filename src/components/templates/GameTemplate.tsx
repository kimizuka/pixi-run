import * as PIXI from 'pixi.js';
import styled from 'styled-components';
import { useEffect, useState, useRef } from 'react';
import Bg from '../../scripts/Bg';
import Items from '../../scripts/Items'
import Player from '../../scripts/Player';

const Wrapper = styled.div`
  width: 100vw;
  background: #a1741b;
  cursor: pointer;
  overflow: hidden;

  canvas {
    display: block;
  }

  .time {
    position: fixed;
    top: 0; left: 0;
  }

  .btnStart {
    position: fixed;
    top: 50%; left: 50%;
    color: white;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .popup {
    visibility: hidden;
    box-sizing: border-box;
    position: absolute;
    top: 0; bottom: 0;
    left: 0; right: 0;
    margin: auto;
    border-radius: 2px;
    width: 280px; height: 225px;
    background: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, .2);
    opacity: 0;
    transform: scale(.05);
    transition: all .2s ease-in-out;

    .box {
      padding: 24px;
    }

    .ttl {
      margin-bottom: 20px;
      font-size: 10px;
    }

    .btn {
      position: absolute;
      right: 0; bottom: 0;
      margin: 8px; padding: 12px;
      color: #2196f3;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
    }

      &[data-is-show="true"] {
      visibility: visible;
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export default function GameTemplate() {
  const [ app, setApp ] = useState(null);
  const [ resources, setResources ] = useState(null);
  const [ world, setWorld ] = useState(null);
  const [ bg, setBg ] = useState(null);
  const [ items, setItems ] = useState(null);
  const [ player, setPlayer ] = useState(null);
  const [ isPause, setIsPause ] = useState(true);
  const [ currentTime, setCurrentTime ] = useState(0);
  const [ hitItem, setHitItem ] = useState(null);
  const canvasRef = useRef(null);
  const debug = new PIXI.Graphics();

  useEffect(() => {
    if (!app) {
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
      setApp(new PIXI.Application({
        view: canvasRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        transparent: true,
        autoDensity: true
      }));
    } else {
      app.loader.reset()
                .add('bg1', '/bg/1.png')
                .add('bg2', '/bg/2.png')
                .load((loader, resources) => {
                  setResources(resources);
                });
    }
  }, [app]);

  useEffect(() => {
    if (!resources) {
      return;
    }

    setWorld(new PIXI.Container());
  }, [resources]);

  useEffect(() => {
    if (!world) {
      return;
    }

    setBg(new Bg([{
      texture: resources.bg1,
      width: 512,
      height: 384
    }, {
      texture: resources.bg2,
      width: 768,
      height: 256
    }]));
  }, [world]);

  useEffect(() => {
    if (!bg) {
      return;
    }

    bg.setDuration(4000);
    world.addChild(bg.container);

    setItems(new Items(1));
  }, [bg]);

  useEffect(() => {
    if (!items) {
      return;
    }

    items.setDuration(4000);
    world.addChild(items.container);

    setPlayer(new Player);
  }, [items]);

  useEffect(() => {
    if (!player) {
      return;
    }

    player.on('hit', (item) => {
      console.log(item);
      setHitItem({
        txt: 'Ya-Ha-!'
      });
      pause();
    });
    world.addChild(player.container);

    init();
  }, [player]);

  function init() {
    setGlobalEvent();
    setStage();
    setTicker();

    world.addChild(debug);
  }

  function setGlobalEvent() {
    handleResize();

    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize, {
      passive: true
    });

    window.removeEventListener('keypress', handleKeyPress);
    window.addEventListener('keypress', handleKeyPress);

    document.body.addEventListener('click', () => {
      handleKeyPress({
        key: ' '
      });
    });
    document.body.addEventListener('touchstart', () => {
      document.body.dispatchEvent(new Event('click'));
    });
  }

  function handleResize() {
    if (!app) {
      return;
    }

    bg.setSize(window.innerWidth, window.innerHeight);
    bg.setBottom(window.innerHeight);
    items.setTop(window.innerHeight - player.jumping.height - player.height);
    player.setPosition(window.innerWidth / 4, window.innerHeight);

    app.renderer.resize(window.innerWidth, window.innerHeight);
  }

  function handleKeyPress(evt) {
    switch (evt.key) {
      case ' ':
        if (!bg.isPlay) {
          handleKeyPress({
            key: 'p'
          });
          return;
        }

        if (player.isPlay) {
          player.jump();
        }
        break;
      case 'p':
        if (bg.isPlay) {
          pause();
        } else {
          setHitItem(null);
          setIsPause(false);
          bg.play();
          items.play();
          player.play();
        }
        break;
    }
  }

  function pause() {
    bg.pause();
    items.pause();
    player.pause();
  }

  function setStage() {
    if (!app) {
      return;
    }

    app.stage.addChild(world);
  }

  function setTicker() {
    if (!app) {
      return;
    }

    app.ticker.add(() => {
      const currentTime = Date.now();

      setCurrentTime(currentTime);
      bg.tick(currentTime);
      items.tick(currentTime);
      player.tick(currentTime);

      if (player.canHit) {
        isHit(bg, items, player);
      }
    });
  }

  function isHit(bg, items, player) {
    const playerHitList = player.getHitList();

    items.getHitItem().forEach((item) => {
      const { x, y } = item;

      debug.lineStyle(1, 0x00FF00)
           .drawRect(
             playerHitList.x.min,
             playerHitList.y.min,
             playerHitList.x.max - playerHitList.x.min,
             playerHitList.y.max - playerHitList.y.min
           ).drawRect(
             x.min,
             y.min,
             x.max - x.min,
             y.max - y.min
           );

      if (y.min <= playerHitList.y.max && playerHitList.y.min <= y.max) {
        if (x.min <= playerHitList.x.max && playerHitList.x.min <= x.max) {
          player.hit(item);
        }
      }
    });
  }

  return (
    <Wrapper>
      <canvas ref={ canvasRef } />
      {(() => {
        return isPause && <p className="btnStart">Tap to Start</p>
      })()}
      <p className="time">{ currentTime }</p>
      <div
        data-is-show={ !!hitItem }
        className="popup"
      >
        <div className="box">
          <p className="ttl">Ya-Ha-!</p>
        </div>
        <div className="btn">CLOSE</div>
      </div>
    </Wrapper>
  );
}
