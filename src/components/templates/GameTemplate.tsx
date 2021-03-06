import * as PIXI from 'pixi.js';
import styled from 'styled-components';
import { useEffect, useState, useRef } from 'react';
import Bg from '../../scripts/Bg';
import Items from '../../scripts/Items'
import Player from '../../scripts/Player';

const Wrapper = styled.div`
  width: 100vw;
  background: #a1741b;
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

    .close {
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

  .btn {
    position: fixed;
    top: 0; bottom: 44px;
    left: 0; right: 0;
  }

  .range {
    display: flex;
    align-item: center;
    justify-content: center;
    position: fixed;
    bottom: 0;
    left: 0; right: 0;
    height: 44px;

    input {
      width: 300px;
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
                .add('bg1', getPath('/bg/1.png'))
                .add('bg2', getPath('/bg/2.png'))
                .add('bg3', getPath('/bg/3.png'))
                .add('bg4', getPath('/bg/4.png'))
                .add('item1', getPath('/item/1.png'))
                .add('player', getPath('/player.png'))
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
      texture: resources.bg4,
      width: 1200,
      height: 480
    }, {
      texture: resources.bg3,
      width: 2800,
      height: 480
    }, {
      texture: resources.bg2,
      width: 3800,
      height: 480
    }, {
      texture: resources.bg1,
      width: 4800,
      height: 480
    }]));
  }, [world]);

  useEffect(() => {
    if (!bg) {
      return;
    }

    bg.setDuration(30000);
    world.addChild(bg.container);

    setItems(new Items([{
      texture: resources.item1,
      x: window.innerWidth * 2,
      y: 100,
      size: 40
    }]));
  }, [bg]);

  useEffect(() => {
    if (!items) {
      return;
    }

    items.setDuration(4000);
    world.addChild(items.container);

    setPlayer(new Player({
      texture: resources.player,
      width: 120,
      height: 120
    }));
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

  function getPath(path) {
    const dir = process.env.NODE_ENV === 'production' ? '/pixi-run' : '';

    return `${ dir }${ path }`;
  }

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
  }

  function handleClickBtn() {
      handleKeyPress({
        key: ' '
      });
  }

  function handleResize() {
    if (!app) {
      return;
    }

    const uiHeight = 44;

    bg.setSize(window.innerWidth, window.innerHeight);
    bg.setBottom(window.innerHeight - uiHeight);
    items.setTop(window.innerHeight - player.jumping.height - player.height - uiHeight);
    player.setPosition(window.innerWidth / 4, window.innerHeight - uiHeight);

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

      // debug.lineStyle(1, 0x00FF00)
      //      .drawRect(
      //        playerHitList.x.min,
      //        playerHitList.y.min,
      //        playerHitList.x.max - playerHitList.x.min,
      //        playerHitList.y.max - playerHitList.y.min
      //      ).drawRect(
      //        x.min,
      //        y.min,
      //        x.max - x.min,
      //        y.max - y.min
      //      );

      if (y.min <= playerHitList.y.max && playerHitList.y.min <= y.max) {
        if (x.min <= playerHitList.x.max && playerHitList.x.min <= x.max) {
          player.hit(item);
        }
      }
    });
  }

  function handleChangeRange(evt) {
    pause();
    bg.seek(evt.target.value);
    items.seek(evt.target.value);
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
          <p className="ttl">???????????????</p>
          <p className="txt">??????????????????</p>
        </div>
        <div className="close">CLOSE</div>
      </div>
      <div className="btn" onClick={ handleClickBtn } />
      <div className="range">
        <input
          value={ bg ? bg.progress : 0 }
          onChange={ handleChangeRange }
          type="range"
          min="0"
          max="1"
          step=".01"
        />
      </div>
    </Wrapper>
  );
}
