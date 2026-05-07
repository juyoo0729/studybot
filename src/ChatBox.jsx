import { useState, useRef, useEffect } from "react";

async function callAiChat(message, { signal } = {}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data?.error || "잠시 후 다시 시도해주세요. 문제가 계속되면 새로고침해보세요.");
  }

  const answer = data?.answer || data?.text;
  if (!answer) throw new Error("응답이 비어 있습니다.");
  return answer;
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

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [retryMsg, setRetryMsg] = useState("");
  const listRef = useRef(null);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    return () => requestControllerRef.current?.abort();
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setRetryMsg("");
    if (!expanded) setExpanded(true);

    try {
      const reply = await callAiChat(text, { signal: controller.signal });
      if (requestIdRef.current !== requestId) return;
      setRetryMsg("");
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (requestIdRef.current !== requestId) return;
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setMessages((prev) => [...prev, { role: "model", text: `❌ ${msg}` }]);
    } finally {
      if (requestIdRef.current === requestId) {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
        setLoading(false);
      }
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
