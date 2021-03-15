import map from "./map.json";
import * as PIXI from "pixi.js";
import { useRef, useEffect } from "react";
import { Sprite } from "pixi.js";
import Keyboard from "./keyboard";

const App = () => {
  const rootRef = useRef();
  const app = useRef();
  const player = useRef();
  const tileTextures = useRef([]);
  const playerTextures = useRef([]);
  const kb = useRef(new Keyboard());

  const scale = 4;
  const playerScale = scale * 1.5;

  const tileOptions = {
    size: 16,
    xCount: 6,
    yCount: 10,
  };

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  useEffect(() => {
    app.current = new PIXI.Application({
      width: 256 * scale,
      height: 160 * scale,
    });

    app.current.loader.onError.add((...args) => console.error(args));
    rootRef.current.appendChild(app.current.view);
    // add element focusable to trigger keyboard events
    app.current.view.setAttribute("tabindex", 0);
    kb.current.watch(app.current.view);

    drawStage();

    return () => {
      app.current.destroy(app.current.view);
    };
  }, []);

  const drawStage = () => {
    app.current.loader
      .add("tiles", "./assets/tileset.png")
      .add("playerwalking", "./assets/walking_sheet.png")
      .load((loader, resource) => {
        generateWorldTiles(resource);
        generatePlayerTiles(resource);

        const bg = new PIXI.Container();
        bg.scale.set(scale);

        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y * map.width + x];
            const sprite = new Sprite(tileTextures.current[tile]);
            sprite.x = x * tileOptions.size;
            sprite.y = y * tileOptions.size;
            bg.addChild(sprite);
          }
        }

        player.current = new PIXI.Sprite(playerTextures.current[0]);
        player.current.scale.set(scale);
        player.current.x = app.current.renderer.width / 2;
        player.current.y = app.current.renderer.height / 2;

        app.current.stage.addChild(bg);
        app.current.stage.addChild(player.current);

        app.current.ticker.add((delta) => gameLoop(delta));
      });
  };

  const generatePlayerTiles = (resource) => {
    const size = 16;
    for (let i = 0; i < 6; i++) {
      let x = i % 6;
      let y = Math.floor(i / 6);
      const texture = new PIXI.Texture(
        resource.playerwalking.texture,
        new PIXI.Rectangle(x * size, y * size, size, size)
      );
      playerTextures.current.push(texture);
    }
  };

  const generateWorldTiles = (resource) => {
    const { size, xCount, yCount } = tileOptions;
    for (let i = 0; i < xCount * yCount; i++) {
      let x = i % xCount;
      let y = Math.floor(i / xCount);
      const texture = new PIXI.Texture(
        resource.tiles.texture,
        new PIXI.Rectangle(x * size, y * size, size, size)
      );
      tileTextures.current.push(texture);
    }
  };

  const hasCollided = (worldX, worldY) => {
    let mapX = Math.floor(worldX / tileOptions.size / scale);
    let mapY = Math.floor(worldY / tileOptions.size / scale);
    return map.collision[mapY * map.width + mapX];
  };

  const character = { x: 0, y: 0, vx: 0, vy: 0 };

  const gameLoop = () => {
    player.current.x = character.x;
    player.current.y = character.y;

    // set max falling velocity for player
    character.vy = Math.min(2 * scale, character.vy + 1);

    if (character.vy > 0) {
      for (let i = 0; i < character.vy; i++) {
        let testX = character.x;
        let testY = character.y + tileOptions.size * scale;
        if (hasCollided(testX, testY)) {
          character.vy = 0;
          break;
        }
        character.y = character.y + 1;
      }
    }

    if (character.vy < 0) {
      character.y += character.vy;
    }

    if (character.vx > 0) {
      character.x = character.vx;
    }

    // Jumb up
    if (kb.current.pressed.ArrowUp) {
      character.vy = -7;
    }

    // Move right
    if (kb.current.pressed.ArrowRight) {
      character.vx += 3;
    }
  };

  return <div ref={rootRef} />;
};

export default App;
