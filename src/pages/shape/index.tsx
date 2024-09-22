import "./main.css";

import { Button, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";

export default function Shape() {
  const SVGPathRef = useRef<SVGPathElement | null>(null);
  const [containerKey, setContainerKey] = useState(0);
  const [containerBeginX, setContainerBeginX] = useState(50);
  const [containerBeginY, setContainerBeginY] = useState(50);
  const [containerEndX, setContainerEndX] = useState(450);
  const [containerEndY, setContainerEndY] = useState(450);
  const [percent, setPercent] = useState(0);
  const [point, setPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [curveStep, setCurveStep] = useState(0.01);

  function cubicOut(t: number) {
    return 1 - (1 - t) ** 3;
  }

  function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
  }

  function drawCurve(begin: { x: number; y: number }, end: { x: number; y: number }) {
    if (!SVGPathRef.current) return;
    let phase = 0;
    const pathData = [];
    while (phase < 1) {
      const x = Math.round(end.x - lerp(begin.x, end.x, phase));
      const y = Math.round(lerp(begin.y, end.y, cubicOut(phase)));
      if (phase === 0) {
        pathData.push(`M${x},${y}`);
      } else {
        pathData.push(`L${x},${y}`);
      }
      phase += curveStep;
    }

    SVGPathRef.current?.setAttribute("d", pathData.join(" "));
  }

  // 计算path元素指定百分比位置的坐标
  function getPositionByPercent(percent: number) {
    if (!SVGPathRef.current) return;
    const realPercent = Math.min(Math.max(0, percent / 100), 1);
    const pathLength = SVGPathRef.current.getTotalLength();

    const position = SVGPathRef.current.getPointAtLength(pathLength * realPercent);
    console.log(percent, position);
    setPoint({ x: position.x, y: position.y });
  }

  useEffect(() => {
    drawCurve({ x: containerBeginX, y: containerBeginY }, { x: containerEndX, y: containerEndY });
  }, [containerKey]);

  useEffect(() => {
    getPositionByPercent(percent);
  }, [percent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPercent((percent + 1) % 100);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="container">
      <h2>SVG</h2>
      <div className="form-box">
        <Form
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 500 }}
          autoComplete="off"
        >
          <Form.Item label="起点">
            <Input
              value={containerBeginX}
              onChange={(event) => {
                setContainerBeginX(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
            <Input
              value={containerBeginY}
              onChange={(event) => {
                setContainerBeginY(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
          </Form.Item>
          <Form.Item label="终点">
            <Input
              value={containerEndX}
              onChange={(event) => {
                setContainerEndX(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
            <Input
              value={containerEndY}
              onChange={(event) => {
                setContainerEndY(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
          </Form.Item>
          <Form.Item label="点数">
            <Input
              value={curveStep}
              onChange={(event) => {
                setCurveStep(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
          </Form.Item>
          <Form.Item label="百分比">
            <Input
              value={percent}
              onChange={(event) => {
                setPercent(Number(event.target.value));
              }}
              autoComplete="off"
            ></Input>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => setContainerKey(containerKey + 1)}>
              重绘
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="svg-box">
        <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="blue" />
              <stop offset="100%" stopColor="red" />
            </linearGradient>
          </defs>
          <path ref={SVGPathRef} stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx={point.x} cy={point.y} r="4" fill="red" />
        </svg>
      </div>
    </div>
  );
}