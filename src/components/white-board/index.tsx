import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import "./main.css";

export default function WhiteBoard() {
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [canvasHeight, setCanvasHeight] = useState(400);

  const myWhiteBoard = useRef<HTMLDivElement | null>(null);
  const myCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (myWhiteBoard.current) {
      setCanvasWidth(myWhiteBoard.current.clientWidth);
      setCanvasHeight(myWhiteBoard.current.clientHeight);
    }
    if (myCanvas.current) {
      const ctx = myCanvas.current.getContext("2d");
      if (!ctx) return;
      initHandler(myCanvas.current, ctx);
    }
  }, []);

  function initHandler(
    myCanvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    // Set Background Color
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    // Mouse Event Handlers

    let isDown = false;
    let canvasX = 0;
    let canvasY = 0;
    ctx.lineWidth = 4;

    const mouseDraw = {
      mousedown: function (evt: MouseEvent) {
        isDown = true;
        ctx.beginPath();
        const scrollTop = window.scrollY;
        canvasX = evt.pageX - myCanvas.getBoundingClientRect().left;
        canvasY = evt.pageY - myCanvas.getBoundingClientRect().top - scrollTop;
        ctx.moveTo(canvasX, canvasY);
      },
      mousemove: function (evt: MouseEvent) {
        if (isDown !== false) {
          const scrollTop = window.scrollY;
          canvasX = evt.pageX - myCanvas.getBoundingClientRect().left;
          canvasY =
            evt.pageY - myCanvas.getBoundingClientRect().top - scrollTop;
          ctx.lineTo(canvasX, canvasY);
          ctx.strokeStyle = "#000";
          ctx.stroke();
        }
      },
      mouseup: function () {
        isDown = false;
        ctx.closePath();
      },
      mouseleave: function () {
        isDown = false;
        ctx.closePath();
      },
    };

    // Mouse Events
    myCanvas.addEventListener("mousedown", mouseDraw.mousedown, false);
    myCanvas.addEventListener("mouseup", mouseDraw.mouseup, false);
    myCanvas.addEventListener("mousemove", mouseDraw.mousemove, false);
    myCanvas.addEventListener("mouseleave", mouseDraw.mouseleave, false);

    // Disable Page Move
    document.body.addEventListener(
      "touchmove",
      function (evt) {
        evt.stopPropagation();
      },
      false
    );
  }

  const handleReset = () => {
    const ctx = myCanvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      0,
      0,
      myCanvas.current?.width || canvasWidth,
      myCanvas.current?.height || canvasHeight
    );
  };

  return (
    <div className="white-board">
      <div className="action-bar">
        <Button type="primary" onClick={handleReset}>
          重置
        </Button>
      </div>
      <div className="white-board-content" ref={myWhiteBoard}>
        <canvas
          id="my-canvas"
          width={canvasWidth}
          height={canvasHeight}
          ref={myCanvas}
        />
      </div>
    </div>
  );
}
