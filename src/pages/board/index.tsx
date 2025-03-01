import type { RadioChangeEvent } from "antd";
import { Button, Radio } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";

import { useCanvas } from "@/hooks/useCanvas";
import { calculateDistance, oppositeColor, Point, randomColor, rgbToHex } from "@/utils/index";

import type { Circle, Line, Rect, ShapeType } from "./types";
import { useDrawing } from "./useDrawing";

const BACKGROUND_COLOR = "#274c43";
const PEN_COLOR = "#ffffff";

function Board() {
  const [shapeType, setShapeType] = useState<ShapeType>("line");
  const [shapeList, updateShapeList] = useImmer<Array<Line | Circle | Rect>>([]);
  const [data, updateData] = useImmer({
    status: "drawEnd",
    canvasWidth: 640,
    canvasHeight: 480,
    fillStyle: BACKGROUND_COLOR,
    strokeStyle: PEN_COLOR,
  });
  // 控制点鼠标样式
  const [cursorType, setCursorType] = useState("crosshair");

  const { canvasRef, ctxRef } = useCanvas(data.canvasWidth, data.canvasHeight);
  const myWhiteBoard = useRef<HTMLDivElement | null>(null);

  const { drawLine, drawCircle, drawRect } = useDrawing(data.strokeStyle);

  const getMousePosition = useCallback(
    (evt: MouseEvent): Point => {
      if (!canvasRef.current) {
        return { x: 0, y: 0 };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef],
  );

  // 使用 useCallback 优化事件处理函数
  const handleReset = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.fillStyle = data.fillStyle;
    ctxRef.current.strokeStyle = data.strokeStyle;
    ctxRef.current.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
    updateShapeList([]);
  }, [ctxRef, data.fillStyle, data.strokeStyle, data.canvasWidth, data.canvasHeight, updateShapeList]);

  useEffect(() => {
    if (myWhiteBoard.current) {
      const width = myWhiteBoard.current.clientWidth || 640;
      const height = 480;

      // draft为Proxy对象,会自动计算改变的部分，并创建新对象
      updateData((draft) => {
        draft.canvasWidth = width;
        draft.canvasHeight = height;
      });

      if (!canvasRef.current) return;

      canvasRef.current.width = width;
      canvasRef.current.height = height;

      handleReset();
    }
  }, [canvasRef, ctxRef, handleReset, updateData]);

  const createShape = (
    type: ShapeType,
    key: "move" | "end",
    down: Point,
    current: Point,
    colors: string[],
  ): Line | Circle | Rect => {
    switch (type) {
      case "line":
        return {
          type: "line",
          key,
          begin: down,
          end: current,
          colors,
          active: false,
        };
      case "circle":
        return {
          type: "circle",
          key,
          begin: down,
          radius: calculateDistance(down, current),
          colors: [],
          active: false,
        };
      case "rect":
        return {
          type: "rect",
          key,
          begin: down,
          width: current.x - down.x,
          height: current.y - down.y,
          colors: [],
          active: false,
        };
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return () => null;
    const canvas = canvasRef.current;
    class MouseDraw {
      isDown = false;
      shapeType: ShapeType = "line";
      pickColor = "";
      downColor = "";
      upColor = "";
      down: Point = { x: 0, y: 0 };
      current: Point = { x: 0, y: 0 };
      up: Point = { x: 0, y: 0 };

      constructor(shapeType: ShapeType = "line") {
        this.shapeType = shapeType;
      }

      mousedown = (evt: MouseEvent) => {
        try {
          if (!ctxRef.current) return;

          this.isDown = true;
          this.down = getMousePosition(evt);

          const newColor = randomColor();
          this.downColor = rgbToHex(newColor.r, newColor.g, newColor.b);
          this.upColor = oppositeColor(this.downColor);

          const pickColor = ctxRef.current.getImageData(this.down.x, this.down.y, 1, 1).data;
          this.pickColor = rgbToHex(pickColor[0], pickColor[1], pickColor[2]);
          setCursorType(this.pickColor !== BACKGROUND_COLOR ? "grab" : "crosshair");
        } catch (error) {
          console.error("Error in mousedown:", error);
          this.isDown = false;
        }
      };

      mousemove = (evt: MouseEvent) => {
        if (!this.isDown) return;

        this.current = getMousePosition(evt);
        const shape = createShape(this.shapeType, "move", this.down, this.current, [this.downColor, this.upColor]);

        updateShapeList((draft) => {
          let targetIndex = -1;

          // 如果是直线并且选中了颜色，则只更新选中的直线
          if (this.shapeType === "line" && this.pickColor !== BACKGROUND_COLOR) {
            setCursorType("grabbing");
            const activeIndex = draft.findIndex((item) => item.type === "line" && item.active);
            targetIndex =
              activeIndex !== -1
                ? activeIndex
                : draft.findIndex((item) => item.type === "line" && item.colors.includes(this.pickColor));

            if (targetIndex !== -1 && draft[targetIndex].type === "line") {
              const data = draft[targetIndex] as Line;
              Object.assign(shape, {
                ...data,
                begin: data.colors.indexOf(this.pickColor) === 0 ? this.current : data.begin,
                end: data.colors.indexOf(this.pickColor) === 1 ? this.current : data.end,
                active: true,
              });
            }
          }

          draft.splice(targetIndex, 1, shape);
        });
      };

      mouseup = (evt: MouseEvent) => {
        if (!this.isDown) return;

        this.isDown = false;
        this.up = getMousePosition(evt);

        updateShapeList((draft) => {
          if (this.pickColor !== BACKGROUND_COLOR) {
            draft.forEach((ele) => {
              ele.active = false;
            });
          } else {
            draft.push(createShape(this.shapeType, "end", this.down, this.current, [this.downColor, this.upColor]));
          }
        });

        setCursorType("crosshair");
      };

      mouseleave = () => {
        this.isDown = false;
      };
    }

    const mouseDraw = new MouseDraw(shapeType);

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
  }, [canvasRef, ctxRef, getMousePosition, shapeType, updateShapeList]);

  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.fillStyle = data.fillStyle;
    ctxRef.current.fillRect(0, 0, data.canvasWidth, data.canvasWidth);

    shapeList
      .filter((item) => item.key !== "end")
      .forEach((shape) => {
        switch (shape.type) {
          case "line":
            drawLine(ctxRef.current!, shape);
            break;
          case "circle":
            drawCircle(ctxRef.current!, shape);
            break;
          case "rect":
            drawRect(ctxRef.current!, shape);
            break;
        }
      });
  }, [ctxRef, data, drawCircle, drawLine, drawRect, shapeList]);

  const onChangeShapeType = useCallback((e: RadioChangeEvent) => {
    setShapeType(e.target.value as ShapeType);
  }, []);

  return (
    <div className="p-5">
      <div className="relative mt-2 mb-2">
        <div className="action-bar flex justify-start gap-2 w-full mb-2">
          <Radio.Group onChange={onChangeShapeType} value={shapeType} buttonStyle="solid">
            <Radio.Button value={"line"}>line</Radio.Button>
            <Radio.Button value={"circle"}>circle</Radio.Button>
            <Radio.Button value={"rect"}>rect</Radio.Button>
          </Radio.Group>
          <Button type="primary" onClick={handleReset}>
            重置
          </Button>
        </div>
        <div className="white-board-content relative border border-[#ccc] rounded bg-white" ref={myWhiteBoard}>
          <canvas id="my-canvas" className="cursor-crosshair" ref={canvasRef} style={{ cursor: cursorType }} />
        </div>
      </div>
    </div>
  );
}

export default Board;
