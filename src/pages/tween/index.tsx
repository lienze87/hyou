import "./main.css";

import { Application, Graphics, Point, Text } from "pixi.js";
import { useEffect } from "react";

export default function Tween() {
  let app: Application | null = null;
  async function initApp() {
    app = new Application();
    const body = document.querySelector("#container") as HTMLElement;
    await app.init({ background: "#1099bb", resizeTo: body });

    body.appendChild(app.canvas);

    const rect = new Graphics().rect(0, 0, 100, 100).fill({ color: 0xff0000 });
    rect.y = app.screen.height / 2;
    app.stage.addChild(rect);

    const functionRectWidth = 600;
    const functionRectHeight = 300;
    const functionRect = new Graphics().rect(0, 0, functionRectWidth, functionRectHeight).stroke(0x00ff00);
    app.stage.addChild(functionRect);
    let pathList: Point[] = [];

    const playText = new Text({
      text: "click me",
      style: {
        fontFamily: "Arial",
        fontSize: 36,
        fontStyle: "italic",
        fontWeight: "bold",
      },
    });

    playText.x = app.screen.width / 2;
    playText.y = app.screen.height - 200;
    app.stage.addChild(playText);

    // Set the interactivity.
    playText.eventMode = "static";
    playText.cursor = "pointer";
    playText.addListener("pointerdown", () => {
      startPlay();
    });

    let running = false;
    // Function to start playing.
    function startPlay() {
      if (running) return;
      running = true;

      pathList = [];
      rect.x = 0;

      const target = 600;
      const time = 3000;

      tweenTo(rect, "x", target, time, backout(0.5), null, reelsComplete);
    }

    function drawPath() {
      functionRect.removeChildren();
      pathList.forEach((ele: Point, index: number) => {
        if (index % 10 === 0) {
          const point = new Graphics().circle(0, 0, 2).fill({ color: 0x0000ff });
          point.x = Math.ceil(ele.x * functionRectWidth);
          point.y = Math.ceil(ele.y * functionRectHeight);
          functionRect.addChild(point);
          console.log(point.y, ele.y);
        }
      });
    }

    // Reels done handler.
    function reelsComplete() {
      running = false;
      drawPath();
    }

    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening: any[] = [];

    function tweenTo(
      object: any,
      property: string,
      target: number,
      time: number,
      easing: (t: number) => number,
      onchange: null | (() => void),
      oncomplete: null | (() => void),
    ) {
      const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
      };

      tweening.push(tween);

      return tween;
    }
    // Listen for animate update.
    app.ticker.add(() => {
      const now = Date.now();
      const remove = [];

      for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        // lerp实现插值
        // t.easing-backout实现超出后回缩效果
        const nowVal = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        t.object[t.property] = nowVal;

        if (running) {
          pathList.push(new Point(nowVal / t.target, phase));
        }

        if (t.change) t.change(t);
        if (phase === 1) {
          t.object[t.property] = t.target;
          if (t.complete) t.complete(t);
          remove.push(t);
        }
      }
      for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
      }
    });

    // Basic lerp funtion.
    function lerp(a1: number, a2: number, t: number) {
      return a1 * (1 - t) + a2 * t;
    }

    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount: number) {
      return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
    }
  }

  useEffect(() => {
    initApp();
  }, []);

  return <div id="container"></div>;
}
