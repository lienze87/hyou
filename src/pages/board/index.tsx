import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { Button } from "antd";
import "./main.css";

const BACKGROUND_COLOR = "#274c43";
const PEN_COLOR = "#ffffff";
const CONTROL_POINT_RADIUS = 10;

type Line = {
  key: string;
  begin: { x: number; y: number };
  end: { x: number; y: number };
  colors: string[];
  active: boolean;
};

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function randomColor() {
  return { r: randomInt(256), g: randomInt(256), b: randomInt(256) };
}

// 计算指定颜色的相反色
function oppositeColor(color: string) {
  return `#${(0xffffff - Number(`0x${color.slice(1)}`)).toString(16)}`;
}

function rgbToHex(r: number, g: number, b: number) {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  const hex = ((r << 16) | (g << 8) | b).toString(16);

  return "#" + ("000000" + hex).slice(-6);
}

export default function MainApp() {
  const [lineList, updateLineList] = useImmer<Array<Line>>([]);
  const [data, updateData] = useImmer({
    status: "drawEnd",
    canvasWidth: 640,
    canvasHeight: 480,
    fillStyle: BACKGROUND_COLOR,
    strokeStyle: PEN_COLOR,
  });
  // 控制点鼠标样式
  const [cursorType, setCursorType] = useState("crosshair");

  const myWhiteBoard = useRef<HTMLDivElement | null>(null);
  const myCanvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  function drawLine(ctx: CanvasRenderingContext2D | null, point: Line) {
    if (!ctx) return;
    const { begin, end, colors } = point;

    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = data.strokeStyle;
    ctx.stroke();

    // 绘制控制点
    ctx.beginPath();
    ctx.arc(begin.x, begin.y, CONTROL_POINT_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = colors[0];
    ctx.fill();

    // 绘制控制点
    ctx.beginPath();
    ctx.arc(end.x, end.y, CONTROL_POINT_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = colors[1];
    ctx.fill();

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
    pickColor: "",
    downColor: "",
    upColor: "",
    down: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    up: { x: 0, y: 0 },
    mousedown: function (evt: MouseEvent) {
      this.isDown = true;

      this.down = getMousePosition(evt);

      // 设置控制点的颜色
      const newColor = randomColor();
      this.downColor = rgbToHex(newColor.r, newColor.g, newColor.b);
      this.upColor = oppositeColor(this.downColor);

      // 存储选中的控制点颜色
      if (ctx.current) {
        const pickColor = ctx.current.getImageData(
          this.down.x,
          this.down.y,
          1,
          1
        ).data;

        this.pickColor = rgbToHex(pickColor[0], pickColor[1], pickColor[2]);
        if (this.pickColor !== BACKGROUND_COLOR) {
          setCursorType("grab");
        } else {
          setCursorType("crosshair");
        }
      }
    },
    mousemove: function (evt: MouseEvent) {
      if (this.isDown) {
        this.current = getMousePosition(evt);

        let line = {
          key: "move",
          begin: this.down,
          end: this.current,
          colors: [this.downColor, this.upColor],
          active: false,
        };

        updateLineList((draft) => {
          let targetLineIndex = -1;
          const activeLineIndex = draft.findIndex((item) => item.active);
          if (this.pickColor !== BACKGROUND_COLOR) {
            setCursorType("grabbing");
            if (activeLineIndex === -1) {
              targetLineIndex = draft.findIndex((item) =>
                item.colors.includes(this.pickColor)
              );
            } else {
              targetLineIndex = activeLineIndex;
            }

            if (targetLineIndex !== -1) {
              if (this.pickColor === draft[targetLineIndex].colors[0]) {
                line = {
                  ...draft[targetLineIndex],
                  begin: this.current,
                  active: true,
                };
              } else if (this.pickColor === draft[targetLineIndex].colors[1]) {
                line = {
                  ...draft[targetLineIndex],
                  end: this.current,
                  active: true,
                };
              }
            }
          }

          // draft.splice(-1, 1, line);替换最后一个元素
          draft.splice(targetLineIndex, 1, line);
        });
      }
    },
    mouseup: function (evt: MouseEvent) {
      this.isDown = false;

      this.up = getMousePosition(evt);

      if (this.pickColor !== BACKGROUND_COLOR) {
        updateLineList((draft) => {
          draft.forEach((ele: Line) => (ele.active = false));
        });
      } else {
        const line = {
          key: "end",
          begin: this.down,
          end: this.up,
          colors: [this.downColor, this.upColor],
          active: false,
        };

        updateLineList((draft) => {
          draft.push(line);
        });
      }

      this.pickColor = "";
      setCursorType("crosshair");
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
          <canvas
            id="my-canvas"
            ref={myCanvas}
            style={{ cursor: cursorType }}
          />
        </div>
      </div>
    </div>
  );
}
