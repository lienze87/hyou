import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { Button } from "antd";
import "./main.css";

const BACKGROUND_COLOR = "#274c43";
const PEN_COLOR = "#ffffff";

type Point = {
  key: string;
  begin: { x: number; y: number };
  end: { x: number; y: number };
};

export default function MainApp() {
  const [lineList, updateLineList] = useImmer<Array<Point>>([]);
  const [data, updateData] = useImmer({
    status: "drawEnd",
    canvasWidth: 640,
    canvasHeight: 480,
    fillStyle: BACKGROUND_COLOR,
    strokeStyle: PEN_COLOR,
  });

  const myWhiteBoard = useRef<HTMLDivElement | null>(null);
  const myCanvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  function drawLine(
    ctx: CanvasRenderingContext2D | null,
    point: {
      begin: { x: number; y: number };
      end: { x: number; y: number };
    }
  ) {
    if (!ctx) return;
    const { begin, end } = point;
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = data.strokeStyle;
    ctx.stroke();
    ctx.closePath();
  }

  const getMousePosition = (evt: MouseEvent): { x: number; y: number } => {
    if (!myCanvas.current) {
      return { x: 0, y: 0 };
    }
    const scrollTop = window.scrollY;
    const position = {
      x: evt.pageX - myCanvas.current.getBoundingClientRect().left,
      y: evt.pageY - myCanvas.current.getBoundingClientRect().top - scrollTop,
    };
    return position;
  };

  // Mouse Event Handlers
  const mouseDraw = {
    isDown: false,
    down: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    up: { x: 0, y: 0 },
    mousedown: function (evt: MouseEvent) {
      this.isDown = true;

      this.down = getMousePosition(evt);
    },
    mousemove: function (evt: MouseEvent) {
      if (this.isDown) {
        this.current = getMousePosition(evt);
        const line = {
          key: "move",
          begin: this.down,
          end: this.current,
        };

        updateLineList((draft) => {
          draft.splice(-1, 1, line);
        });
      }
    },
    mouseup: function (evt: MouseEvent) {
      this.isDown = false;

      this.up = getMousePosition(evt);

      const line = {
        key: "end",
        begin: this.down,
        end: this.up,
      };

      updateLineList((draft) => {
        draft.push(line);
      });
    },
    mouseleave: function () {
      this.isDown = false;
    },
  };

  useEffect(() => {
    if (myWhiteBoard.current) {
      const width = myWhiteBoard.current.clientWidth || 640;
      const height = 480;

      // draft为Proxy对象,会自动计算改变的部分，并创建新对象
      updateData((draft) => {
        draft.canvasWidth = width;
        draft.canvasHeight = height;
      });

      if (!myCanvas.current) return;
      const canvas = myCanvas.current;

      canvas.width = width;
      canvas.height = height;

      ctx.current = canvas.getContext("2d");

      handleReset();

      // Mouse Events
      canvas.addEventListener("mousedown", mouseDraw.mousedown, false);
      canvas.addEventListener("mouseup", mouseDraw.mouseup, false);
      canvas.addEventListener("mousemove", mouseDraw.mousemove, false);
      canvas.addEventListener("mouseleave", mouseDraw.mouseleave, false);

      return () => {
        canvas.removeEventListener("mousedown", mouseDraw.mousedown, false);
        canvas.removeEventListener("mouseup", mouseDraw.mouseup, false);
        canvas.removeEventListener("mousemove", mouseDraw.mousemove, false);
        canvas.removeEventListener("mouseleave", mouseDraw.mouseleave, false);
      };
    }
  }, []);

  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.fillStyle = data.fillStyle;
    ctx.current.fillRect(0, 0, data.canvasWidth, data.canvasWidth);

    lineList.forEach((line) => {
      if (line.key !== "end") {
        drawLine(ctx.current, line);
      }
    });
  }, [lineList]);

  const handleReset = () => {
    if (!ctx.current) return;
    ctx.current.fillStyle = data.fillStyle;
    ctx.current.strokeStyle = data.strokeStyle;
    ctx.current.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
    updateLineList(() => []);
  };

  return (
    <div className="container">
      <h2>画板</h2>
      <div className="white-board">
        <div className="action-bar">
          <Button type="primary" onClick={handleReset}>
            重置
          </Button>
        </div>
        <div className="white-board-content" ref={myWhiteBoard}>
          <canvas id="my-canvas" ref={myCanvas} />
        </div>
      </div>
    </div>
  );
}
