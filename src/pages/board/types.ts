import type { Point } from "@/utils";

export type BaseShape = {
  key: string;
  type: string;
  colors: string[];
  active: boolean;
};

export type Line = BaseShape & {
  type: "line";
  begin: Point;
  end: Point;
};

export type Circle = BaseShape & {
  type: "circle";
  begin: Point;
  radius: number;
};

export type Rect = BaseShape & {
  type: "rect";
  begin: Point;
  width: number;
  height: number;
};

export type Shape = Line | Circle | Rect;

export type ShapeType = "line" | "circle" | "rect";
