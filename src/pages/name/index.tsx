import { Button, Checkbox, Form, Input, Radio } from "antd";
import { useState } from "react";

import { doubleSurname, singleSurname } from "@/assets/surname";

export default function NameGenerator() {
  const [surname, setSurname] = useState("");
  const [surnameType, setSurnameType] = useState(1);
  const [surnameFixed, setSurnameFixed] = useState(false);
  const [name, setName] = useState("");
  const [nameType, setNameType] = useState(2);
  const [nameFixed, setNameFixed] = useState(false);

  function getRandomSurname(type = 1) {
    let generatedText = "";
    if (type === 1) {
      const index = Math.floor(Math.random() * singleSurname.length);
      generatedText = singleSurname[index];
    } else if (type === 2) {
      const index = Math.floor(Math.random() * doubleSurname.length);
      generatedText = doubleSurname[index];
    }
    return generatedText;
  }

  function getRandomUnicode(length = 1) {
    // 汉字范围 \u4e00 ~ \u9fa5 共20902个字符
    let generatedText = "";
    for (let i = 0; i < length; i++) {
      const randomUnicode = Math.floor(Math.random() * (40870 - 19968) + 19968).toString(16);
      const character = String.fromCharCode(parseInt(`0x${randomUnicode}`, 16));
      generatedText += character;
    }

    return generatedText;
  }

  function getRandomGB2312(length = 1) {
    let generatedText = "";
    for (let i = 0; i < length; i++) {
      const head = Math.floor(Math.random() * (0xf7 - 0xb0 + 1)) + 0xb0;
      const body = Math.floor(Math.random() * (0xf9 - 0xa1)) + 0xa1;
      const char = String.fromCharCode(head, body);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder("gbk");
      const valBuffer = encoder.encode(char);
      const str = decoder.decode(valBuffer);

      generatedText += str;
    }
    return generatedText;
  }

  function handleGenerate() {
    if (!surnameFixed || surname === "") {
      setSurname(getRandomSurname(Number(surnameType)));
    }
    if (!nameFixed || name === "") {
      setName(getRandomUnicode(Number(nameType)));
    }
    // never execute
    if (Math.random() > 1) {
      setName(getRandomGB2312(Number(nameType)));
    }
  }

  return (
    <div className="p-5">
      <Form name="basic" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ maxWidth: 600 }} autoComplete="off">
        <Form.Item label="固定字符">
          <Checkbox
            checked={surnameFixed}
            onChange={(event: any) => {
              setSurnameFixed(event.target.checked);
            }}
          >
            固定姓氏
          </Checkbox>
          <Checkbox
            checked={nameFixed}
            onChange={(event: any) => {
              setNameFixed(event.target.checked);
            }}
          >
            固定名称
          </Checkbox>
        </Form.Item>
        <Form.Item label="姓氏长度">
          <Radio.Group
            onChange={(event: any) => {
              setSurnameType(event.target.value);
            }}
            value={surnameType}
          >
            <Radio value={1}>单姓</Radio>
            <Radio value={2}>复姓</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="名称长度">
          <Radio.Group
            onChange={(event: any) => {
              setNameType(event.target.value);
            }}
            value={nameType}
          >
            <Radio value={1}>单字</Radio>
            <Radio value={2}>双字</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="姓氏">
          <Input
            value={surname}
            onChange={(event) => {
              setSurname(event.target.value);
            }}
            autoComplete="off"
          ></Input>
        </Form.Item>
        <Form.Item label="名称">
          <Input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => handleGenerate()}>
            生成姓名
          </Button>
        </Form.Item>
      </Form>
      <div className="generated-name p-5">{`${surname}${name}`}</div>
    </div>
  );
}
