import { useCallback } from "react";

type Point = { x: number; y: number };
type CurveType = "circIn" | "linear" | "quadratic" | "bounce";

export function useCurve() {
  // 线性插值
  const lerp = useCallback((start: number, end: number, t: number) => {
    return start + (end - start) * t;
  }, []);

  // 圆形缓动
  const circIn = useCallback((t: number) => {
    return 1 - Math.sqrt(1 - t * t);
  }, []);

  // 二次方缓动
  const quadratic = useCallback((t: number) => {
    return t * t;
  }, []);

  // 弹跳效果
  const bounce = useCallback((t: number) => {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
  }, []);

  // 获取曲线上指定百分比位置的坐标
  const getPointAtPercent = useCallback((pathElement: SVGPathElement, percent: number) => {
    const realPercent = Math.min(Math.max(0, percent / 100), 1);
    const pathLength = pathElement.getTotalLength();
    return pathElement.getPointAtLength(pathLength * realPercent);
  }, []);

  // 生成曲线路径数据
  const generatePathData = useCallback(
    (begin: Point, end: Point, curveType: CurveType, step: number = 0.01) => {
      const pathData: string[] = [];
      let phase = 0;

      const easingFunctions = {
        circIn,
        linear: (t: number) => t,
        quadratic,
        bounce,
      };

      // 根据不同曲线类型调整起点和终点
      let adjustedBegin = { ...begin };
      let adjustedEnd = { ...end };

      switch (curveType) {
        case "circIn":
        case "quadratic":
          adjustedBegin = { x: 0, y: end.y };
          adjustedEnd = { x: end.x, y: 0 };
          break;
        case "linear":
          adjustedBegin = { x: 0, y: end.y };
          adjustedEnd = { x: end.x, y: 0 };
          break;
        case "bounce":
          adjustedBegin = { x: 0, y: end.y / 2 };
          adjustedEnd = { x: end.x, y: end.y / 2 };
          break;
      }

      while (phase <= 1) {
        const x = Math.round(lerp(adjustedBegin.x, adjustedEnd.x, phase));
        const y = Math.round(
          curveType === "bounce"
            ? adjustedBegin.y + end.y * (0.5 - easingFunctions[curveType](phase))
            : lerp(adjustedBegin.y, adjustedEnd.y, easingFunctions[curveType](phase)),
        );

        if (phase === 0) {
          pathData.push(`M${x},${y}`);
        } else {
          pathData.push(`L${x},${y}`);
        }
        phase += step;
      }

      return pathData.join(" ");
    },
    [bounce, circIn, lerp, quadratic],
  );

  return {
    generatePathData,
    getPointAtPercent,
  };
}
