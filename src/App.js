import map from "./map.json";
import * as PIXI from "pixi.js";
import { useRef, useEffect } from "react";
import { Sprite } from "pixi.js";

const App = () => {
  const rootRef = useRef();
  const app = useRef();
  const tileTextures = useRef([]);
  const tileSize = 16;
  const scale = 2;
  
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  useEffect(() => {
    app.current = new PIXI.Application({
      width: 256 * scale,
      height: 160 * scale,
    });

    app.current.loader.onError.add((...args) => console.error(args));
    rootRef.current.appendChild(app.current.view);

    drawStage();

    return () => {
      app.current.destroy(app.current.view);
    };
  }, []);

  const drawStage = () => {
    app.current.loader
      .add("tiles", "./assets/tileset.png")
      .load((loader, resource) => {
        generateTileSet(resource); 
        const bg = new PIXI.Container();
        bg.scale.set(scale);

        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y * map.width + x];
            const sprite = new Sprite(tileTextures.current[tile]);
            sprite.x = x * tileSize;
            sprite.y = y * tileSize;
            bg.addChild(sprite);
          }
        }

        app.current.stage.addChild(bg);
        app.current.ticker.add((delta) => animate(delta));
      });
  };

  const generateTileSet = (resource) => {
    for (let i = 0; i < 60; i++) {
      let x = i % 6;
      let y = Math.floor(i / 6);
      const texture = new PIXI.Texture(
        resource.tiles.texture,
        new PIXI.Rectangle(x * tileSize, y * tileSize, tileSize, tileSize)
      );
      tileTextures.current.push(texture);
    }
  };

  const animate = (delta) => {};

  return <div ref={rootRef} />;
};

export default App;
