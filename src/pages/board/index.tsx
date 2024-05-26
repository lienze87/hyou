import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import type { RadioChangeEvent } from "antd";
import { Button, Radio } from "antd";
import "./main.css";

const BACKGROUND_COLOR = "#274c43";
const PEN_COLOR = "#ffffff";
const CONTROL_POINT_RADIUS = 10;

type Line = {
  type: "line";
  key: string;
  begin: { x: number; y: number };
  end: { x: number; y: number };
  colors: string[];
  active: boolean;
};

type Circle = {
  type: "circle";
  key: string;
  begin: { x: number; y: number };
  radius: number;
  colors: string[];
  active: boolean;
};

type Rect = {
  type: "rect";
  key: string;
  begin: { x: number; y: number };
  width: number;
  height: number;
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
  const [shapeType, setShapeType] = useState("line");
  const [shapeList, updateShapeList] = useImmer<Array<Line | Circle | Rect>>(
    []
  );
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

  function drawLine(ctx: CanvasRenderingContext2D | null, shape: Line) {
    if (!ctx) return;
    const { begin, end, colors } = shape;

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

  function drawCircle(ctx: CanvasRenderingContext2D | null, shape: Circle) {
    if (!ctx) return;
    const { begin, radius } = shape;

    ctx.beginPath();
    ctx.arc(begin.x, begin.y, radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = data.strokeStyle;
    ctx.stroke();

    ctx.closePath();
  }

  function drawRect(ctx: CanvasRenderingContext2D | null, shape: Rect) {
    if (!ctx) return;
    const {
      begin: { x, y },
      width,
      height,
    } = shape;

    ctx.strokeStyle = data.strokeStyle;
    ctx.strokeRect(x, y, width, height);

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

        if (shapeType === "line") {
          let line: Line = {
            type: "line",
            key: "move",
            begin: this.down,
            end: this.current,
            colors: [this.downColor, this.upColor],
            active: false,
          };
          updateShapeList((draft) => {
            let targetLineIndex = -1;

            const activeLineIndex = draft.findIndex(
              (item) => item.type === "line" && item.active
            );
            if (this.pickColor !== BACKGROUND_COLOR) {
              setCursorType("grabbing");
              if (activeLineIndex === -1) {
                targetLineIndex = draft.findIndex(
                  (item) =>
                    item.type === "line" && item.colors.includes(this.pickColor)
                );
              } else {
                targetLineIndex = activeLineIndex;
              }

              if (
                targetLineIndex !== -1 &&
                draft[targetLineIndex].type === "line"
              ) {
                const data = draft[targetLineIndex] as Line;
                line = {
                  ...data,
                  type: "line",
                  begin:
                    data.colors.indexOf(this.pickColor) === 0
                      ? this.current
                      : data.begin,
                  end:
                    data.colors.indexOf(this.pickColor) === 1
                      ? this.current
                      : data.end,
                  active: true,
                };
              }
            }

            // draft.splice(-1, 1, line);替换最后一个元素
            draft.splice(targetLineIndex, 1, line);
          });
        } else if (shapeType === "circle") {
          const radius = Math.sqrt(
            (this.current.x - this.down.x) ** 2 +
              (this.current.y - this.down.y) ** 2
          );
          const circle: Circle = {
            key: "move",
            type: "circle",
            begin: this.down,
            radius,
            colors: [],
            active: false,
          };
          updateShapeList((draft) => {
            const targetLineIndex = -1;

            draft.splice(targetLineIndex, 1, circle);
          });
        } else if (shapeType === "rect") {
          const rect: Rect = {
            key: "move",
            type: "rect",
            begin: this.down,
            width: this.current.x - this.down.x,
            height: this.current.y - this.down.y,
            colors: [],
            active: false,
          };
          updateShapeList((draft) => {
            const targetLineIndex = -1;

            draft.splice(targetLineIndex, 1, rect);
          });
        }
      }
    },
    mouseup: function (evt: MouseEvent) {
      this.isDown = false;

      this.up = getMousePosition(evt);

      if (this.pickColor !== BACKGROUND_COLOR) {
        updateShapeList((draft) => {
          draft.forEach((ele) => (ele.active = false));
        });
      } else {
        updateShapeList((draft) => {
          if (shapeType === "line") {
            const line: Line = {
              type: "line",
              key: "end",
              begin: this.down,
              end: this.current,
              colors: [this.downColor, this.upColor],
              active: false,
            };

            draft.push(line);
          } else if (shapeType === "circle") {
            const radius = Math.sqrt(
              (this.current.x - this.down.x) ** 2 +
                (this.current.y - this.down.y) ** 2
            );
            const circle: Circle = {
              key: "end",
              type: "circle",
              begin: this.down,
              radius,
              colors: [],
              active: false,
            };

            draft.push(circle);
          } else if (shapeType === "rect") {
            const rect: Rect = {
              key: "end",
              type: "rect",
              begin: this.down,
              width: this.current.x - this.down.x,
              height: this.current.y - this.down.y,
              colors: [],
              active: false,
            };

            draft.push(rect);
          }
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
    }
  }, []);

  useEffect(() => {
    if (!myCanvas.current) return;
    const canvas = myCanvas.current;
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
  }, [shapeType]);

  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.fillStyle = data.fillStyle;
    ctx.current.fillRect(0, 0, data.canvasWidth, data.canvasWidth);

    shapeList.forEach((shape) => {
      if (shape.key !== "end") {
        if (shape.type === "line") {
          drawLine(ctx.current, shape);
        } else if (shape.type === "circle") {
          drawCircle(ctx.current, shape);
        } else if (shape.type === "rect") {
          drawRect(ctx.current, shape);
        }
      }
    });
  }, [shapeList]);

  const handleReset = () => {
    if (!ctx.current) return;
    ctx.current.fillStyle = data.fillStyle;
    ctx.current.strokeStyle = data.strokeStyle;
    ctx.current.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
    updateShapeList(() => []);
  };

  const onChangeShapeType = (e: RadioChangeEvent) => {
    setShapeType(e.target.value);
  };

  return (
    <div className="container">
      <h2>画板</h2>
      <div className="white-board">
        <div className="action-bar">
          <Button type="primary" onClick={handleReset}>
            重置
          </Button>
          <Radio.Group
            onChange={onChangeShapeType}
            value={shapeType}
            buttonStyle="solid">
            <Radio.Button value={"line"}>line</Radio.Button>
            <Radio.Button value={"circle"}>circle</Radio.Button>
            <Radio.Button value={"rect"}>rect</Radio.Button>
          </Radio.Group>
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
