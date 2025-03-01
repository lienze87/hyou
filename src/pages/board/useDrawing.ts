import { useCallback } from "react";

import { Circle, Line, Rect } from "./types";

export function useDrawing(strokeStyle: string) {
  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Line) => {
      if (!ctx) return;
      const { begin, end, colors } = shape;

      ctx.save();
      try {
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();

        const [color1, color2] = colors;
        ctx.beginPath();
        ctx.arc(begin.x, begin.y, 10, 0, Math.PI * 2, true);
        ctx.fillStyle = color1;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(end.x, end.y, 10, 0, Math.PI * 2, true);
        ctx.fillStyle = color2;
        ctx.fill();
      } finally {
        ctx.restore();
      }
    },
    [strokeStyle],
  );

  const drawCircle = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Circle) => {
      if (!ctx) return;
      ctx.save();
      try {
        ctx.beginPath();
        ctx.arc(shape.begin.x, shape.begin.y, shape.radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
      } finally {
        ctx.restore();
      }
    },
    [strokeStyle],
  );

  const drawRect = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Rect) => {
      if (!ctx) return;
      ctx.save();
      try {
        ctx.strokeStyle = strokeStyle;
        ctx.strokeRect(shape.begin.x, shape.begin.y, shape.width, shape.height);
      } finally {
        ctx.restore();
      }
    },
    [strokeStyle],
  );

  return { drawLine, drawCircle, drawRect };
}
