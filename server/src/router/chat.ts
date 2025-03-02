import { Hono } from "hono";
import OpenAI from "openai";

const chat = new Hono();
const responseType = "streaming";
const ARK_API_KEY = process.env.ARK_API_KEY;

const openai = new OpenAI({
  apiKey: ARK_API_KEY,
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
});

const modelDoubao = "ep-20250207173714-lvq7q";
// const modelDeepSeek = "ep-20250215114743-rqx57";

chat.post("/", async (c) => {
  const { content } = await c.req.json();
  const input = content || "你的名字是什么？";
  const systemPrompt = `
  你是一个AI人工智能助手，你的任务是启用编程模式，根据用户的需求，生成对应的代码。
  你的代码应该符合以下要求：
  1. 代码应该符合现代前端最佳实践
  2. 如果用户没有要求，请使用typescript编写代码
  3. 如果用户没有要求，请不要在代码中添加额外注释
  4. 如果用户没有要求，请使用markdown格式返回代码
  `;

  if (responseType === "streaming") {
    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: input },
      ],
      model: modelDoubao,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of stream) {
            const content = part.choices[0]?.delta?.content || "";
            controller.enqueue(new TextEncoder().encode(content));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } else {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: input },
      ],
      model: modelDoubao,
    });
    const result = completion.choices[0]?.message?.content;
    return c.json({
      code: 200,
      message: "success",
      data: result,
    });
  }
});

async function renameFile(input: string) {
  const systemPrompt = `
    你是一个AI人工智能助手，你的任务是根据用户提供的图片文件名称，返回新的英文名称。
    新的英文名称应该符合以下要求：
    1. 新的英文名称应该使用小写字母,并使用'-'符号分隔。例如: image-example.jpg.
    2. 新的英文名称应该尽可能的简短且带有描述性, 不要改变图片文件除文件名外的其他信息。例如: 主页背景@2x.png -> homepage-background@2x.png
    3. 如果用户提供的名称没有任何意义,你应该返回一个通用的名称。例如: generic_image_1.jpg
    4. 如果用户提供的已经是英文名称，返回原名称
    5. 仅返回新的英文名称,不要返回任何其他的内容
   `;
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: input },
    ],
    model: modelDoubao,
  });
  return completion.choices[0]?.message?.content;
}

chat.post("/rename", async (c) => {
  const { content } = await c.req.json();
  const input = content || "";
  if (!input) {
    return c.json({
      code: 400,
      message: "content is required",
      data: null,
    });
  }
  const result = await renameFile(input);
  return c.json({
    code: 200,
    message: "success",
    data: result,
  });
});

chat.get("/rename", async (c) => {
  const input = c.req.query("name") || "";
  if (!input) {
    return c.json({
      code: 400,
      message: "content is required",
      data: null,
    });
  }

  const result = await renameFile(input);
  return c.json({
    code: 200,
    message: "success",
    data: result,
  });
});

export default chat;
