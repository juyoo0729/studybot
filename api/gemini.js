const MODEL = "gemini-2.5-flash";
const RETRY_STATUSES = new Set([429, 503]);
const BASE_DELAYS = [1000, 2000, 4000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(baseDelay) {
  return baseDelay + Math.floor(Math.random() * 400);
}

function toKoreanError(status, rawText = "") {
  if (status === 401 || rawText.includes("API_KEY_INVALID"))
    return "API 키가 올바르지 않습니다. 서버 환경 변수를 다시 확인해주세요.";
  if (status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  if (status === 503) return "서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
  if (status === 400) return "요청 형식에 문제가 있습니다. 새로고침 후 다시 시도해주세요.";
  if (!status) return "인터넷 연결을 확인해주세요.";
  return "잠시 후 다시 시도해주세요. 문제가 계속되면 새로고침해보세요.";
}

function lessonBody(prompt) {
  return {
    contents: [
      {
        parts: [
          {
            text: `당신은 매우 뛰어난 전문 튜터입니다. 반드시 아래 규칙을 지켜 설명하세요:

[설명 구조]
1. 먼저 핵심 개념을 쉽게 설명 (비유 포함)
2. 왜 중요한지 (사용 이유)
3. 실제 예시 (생활 또는 코딩)
4. 코드 예시 (가능하면)
5. 초보자가 헷갈리는 포인트 정리
6. 한 줄 핵심 요약

[중요 규칙]
- 절대 짧게 설명하지 말 것
- 중간 생략 금지 (단계별 설명 필수)
- 어려운 용어는 반드시 풀어서 설명
- 핵심 키워드는 **굵게 표시**
- 초보자가 이해할 수 있도록 설명

${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
    },
  };
}

function buildBody(payload) {
  if (payload?.type === "lesson" && typeof payload.prompt === "string") {
    return lessonBody(payload.prompt);
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "허용되지 않는 요청입니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "서버에 Gemini API 키가 설정되어 있지 않습니다." });
  }

  const body = buildBody(req.body);
  if (!body) {
    return res.status(400).json({ error: "요청 형식에 문제가 있습니다. 새로고침 후 다시 시도해주세요." });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= BASE_DELAYS.length; attempt += 1) {
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      if (attempt < BASE_DELAYS.length) {
        await sleep(retryDelay(BASE_DELAYS[attempt]));
        continue;
      }
      return res.status(503).json({ error: "인터넷 연결을 확인해주세요." });
    }

    if (!response.ok) {
      const retryable = RETRY_STATUSES.has(response.status);
      if (retryable && attempt < BASE_DELAYS.length) {
        await sleep(retryDelay(BASE_DELAYS[attempt]));
        continue;
      }

      let rawText = "";
      try {
        rawText = await response.text();
      } catch {}

      return res.status(response.status).json({ error: toKoreanError(response.status, rawText) });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "응답이 비어 있습니다." });
    }

    return res.status(200).json({ text });
  }

  return res.status(503).json({ error: "잠시 후 다시 시도해주세요." });
}
