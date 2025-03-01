import { Button, Form, Input, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";

import { useCurve } from "@/hooks/useCurve";
import { Point } from "@/utils";

type CurveType = "circIn" | "linear" | "quadratic" | "bounce";

interface FormState {
  width: number;
  height: number;
  curveType: CurveType;
  curveStep: number;
  percent: number;
}

export default function Shape() {
  const SVGPathRef = useRef<SVGPathElement | null>(null);
  const [formData, updateFormData] = useImmer<FormState>({
    width: 500,
    height: 500,
    curveType: "circIn",
    curveStep: 0.01,
    percent: 0,
  });
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });

  const { generatePathData, getPointAtPercent } = useCurve();

  useEffect(() => {
    if (!SVGPathRef.current) return;
    const pathData = generatePathData(
      { x: 0, y: 0 },
      {
        x: formData.width,
        y: formData.height,
      },
      formData.curveType,
      formData.curveStep,
    );
    SVGPathRef.current.setAttribute("d", pathData);
  }, [formData, generatePathData]);

  useEffect(() => {
    if (!SVGPathRef.current) return;
    const position = getPointAtPercent(SVGPathRef.current, formData.percent);
    setPoint({ x: position.x, y: position.y });
  }, [formData.percent, getPointAtPercent]);

  useEffect(() => {
    const timer = setInterval(() => {
      updateFormData((draft) => {
        draft.percent = (draft.percent + 1) % 100;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [updateFormData]);

  const updateFormField = (field: keyof FormState, value: number | CurveType) => {
    updateFormData((draft) => {
      (draft[field as keyof FormState] as any) = value;
    });
  };

  return (
    <div className="relative w-full h-full p-5 overflow-hidden">
      <div className="form-box w-full mb-3">
        <Form className="w-full" name="basic" layout="inline" autoComplete="off">
          <Form.Item label="曲线类型">
            <Select
              style={{ width: 120 }}
              value={formData.curveType}
              onChange={(value: CurveType) => updateFormField("curveType", value)}
              options={[
                { value: "circIn", label: "圆形缓动" },
                { value: "linear", label: "线性" },
                { value: "quadratic", label: "二次方" },
                { value: "bounce", label: "弹跳" },
              ]}
            />
          </Form.Item>
          <Form.Item label="点数">
            <Input
              value={formData.curveStep}
              onChange={(e) => updateFormField("curveStep", Number(e.target.value))}
              autoComplete="off"
            />
          </Form.Item>
          <Form.Item label="百分比">
            <Input
              value={formData.percent}
              onChange={(e) => updateFormField("percent", Number(e.target.value))}
              autoComplete="off"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => updateFormField("percent", 0)}>
              重绘
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="svg-box flex justify-center items-center p-2 bg-slate-300 shadow">
        <svg width={formData.width} height={formData.height} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
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
