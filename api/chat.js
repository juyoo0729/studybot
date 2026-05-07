import OpenAI from "openai";

function latestUserMessage(messages) {
  if (!Array.isArray(messages)) return "";

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "user" && typeof message.text === "string") {
      return message.text;
    }
  }

  return "";
}

function requestMessage(body) {
  if (typeof body?.message === "string") return body.message;
  return latestUserMessage(body?.messages);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const trimmed = requestMessage(req.body).trim();

    if (!trimmed) {
      return res.status(400).json({ error: "message is required" });
    }

    if (trimmed.length > 1000) {
      return res.status(400).json({ error: "message is too long" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "너는 친절한 한국어 학습 도우미다. 어렵지 않게 설명하고, 핵심을 먼저 말해라.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: trimmed,
            },
          ],
        },
      ],
    });

    const answer = response.output_text ?? "응답을 생성하지 못했습니다.";

    return res.status(200).json({
      answer,
      text: answer,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);

    return res.status(500).json({
      error: "AI 응답 생성 중 오류가 발생했습니다.",
    });
  }
}
