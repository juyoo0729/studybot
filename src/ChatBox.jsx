import { useState, useRef, useEffect } from "react";

function toChatKoreanError(status, rawText = "") {
  if (status === 401 || rawText.includes("API_KEY_INVALID"))
    return "API 키가 올바르지 않습니다. 키를 다시 확인해주세요.";
  if (status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  if (status === 503) return "서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
  if (status === 400) return "요청 형식에 문제가 있습니다. 새로고침 후 다시 시도해주세요.";
  if (!status) return "인터넷 연결을 확인해주세요.";
  return "잠시 후 다시 시도해주세요. 문제가 계속되면 새로고침해보세요.";
}

async function callGeminiChat(apiKey, messages, onRetry) {
  const model = "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
  const body = JSON.stringify({
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    systemInstruction: {
      parts: [{ text: "당신은 친절하고 유능한 학습 도우미입니다. 학생의 질문에 명확하고 이해하기 쉽게 답변하세요. 핵심 키워드는 **굵게** 표시하고, 코드가 필요하면 코드 블록을 사용하세요." }],
    },
    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
  });
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch {
      if (attempt < delays.length) {
        if (onRetry) onRetry(attempt + 1);
        await new Promise((r) => setTimeout(r, delays[attempt]));
        continue;
      }
      throw new Error("인터넷 연결을 확인해주세요.");
    }

    if (!response.ok) {
      const isRetryable = response.status === 503 || response.status === 429;
      if (isRetryable && attempt < delays.length) {
        if (onRetry) onRetry(attempt + 1);
        await new Promise((r) => setTimeout(r, delays[attempt]));
        continue;
      }
      let rawText = "";
      try { rawText = await response.text(); } catch {}
      throw new Error(toChatKoreanError(response.status, rawText));
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("응답이 비어 있습니다.");
    return text;
  }
}

function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background: isUser ? "#1f3354" : "#161b22",
          border: `1px solid ${isUser ? "#30507a" : "#30363d"}`,
          fontSize: 12,
          lineHeight: 1.7,
          color: "#c9d1d9",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function ChatBox({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [retryMsg, setRetryMsg] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setRetryMsg("");
    if (!expanded) setExpanded(true);

    try {
      const reply = await callGeminiChat(apiKey, next, (attempt) => {
        setRetryMsg(`⏳ 재시도 중... (${attempt}/3)`);
      });
      setRetryMsg("");
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setMessages((prev) => [...prev, { role: "model", text: `❌ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#161b22", borderTop: "1px solid #21262d", flexShrink: 0 }}>
      {expanded && (
        <div
          ref={listRef}
          style={{
            height: 240,
            overflowY: "auto",
            padding: "10px 14px",
            borderBottom: "1px solid #21262d",
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#484f58", fontSize: 12, paddingTop: 88 }}>
              궁금한 것을 자유롭게 질문하세요!
            </div>
          ) : (
            messages.map((m, i) => <ChatMessage key={i} role={m.role} text={m.text} />)
          )}
          {loading && (
            <div style={{ color: "#8b949e", fontSize: 12, padding: "4px 2px" }}>
              {retryMsg || "AI가 답변을 작성 중..."}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px" }}>
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            border: "1px solid #21262d",
            background: expanded ? "#1f3354" : "transparent",
            color: expanded ? "#58a6ff" : "#484f58",
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          💬{messages.length > 0 ? ` ${messages.length}` : ""}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="자유롭게 질문하세요... (Enter로 전송)"
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #30363d",
            background: "#0d1117",
            color: "#e2e8f0",
            fontSize: 12,
            outline: "none",
          }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "none",
            background: input.trim() && !loading ? "#58a6ff" : "#21262d",
            color: input.trim() && !loading ? "#000" : "#484f58",
            fontSize: 12,
            fontWeight: 700,
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
