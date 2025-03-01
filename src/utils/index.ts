export type Point = {
  x: number;
  y: number;
};

// 生成随机整数
export function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

// 生成随机颜色
export function randomColor() {
  return { r: randomInt(256), g: randomInt(256), b: randomInt(256) };
}

// 计算指定颜色的相反色
export function oppositeColor(color: string) {
  return `#${(0xffffff - Number(`0x${color.slice(1)}`)).toString(16)}`;
}

// 将 RGB 颜色转换为十六进制字符串
export function rgbToHex(r: number, g: number, b: number) {
  if (r > 255 || g > 255 || b > 255) {
    throw new Error("Invalid color component");
  }

  const hex = ((r << 16) | (g << 8) | b).toString(16);

  return `#${`000000${hex}`.slice(-6)}`;
}
// 计算两点之间的距离
export const calculateDistance = (p1: Point, p2: Point) => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};
