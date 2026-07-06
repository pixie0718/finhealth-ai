import React, { useState, useRef, useEffect } from "react";
import { sendChat } from "../api/client";

const SUGGESTIONS = [
  "What does my overall score mean?",
  "How can I improve my Cash Flow score?",
  "What loan products am I eligible for?",
  "Explain my SHAP strengths and risks",
  "What is the Account Aggregator framework?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 8, alignSelf: "flex-end",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#3b82f6" : "var(--c-surface)",
        border: isUser ? "none" : "1px solid var(--c-border)",
        fontSize: 13,
        color: isUser ? "#fff" : "#cbd5e1",
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatAssistant({ scoreContext = null, liftForNav = false }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: scoreContext
        ? `Hi! I'm your FinHealth AI Assistant. I can see ${scoreContext.business_name}'s financial health report. Ask me anything about their score, loan eligibility, or how to improve it.`
        : "Hi! I'm your FinHealth AI Assistant. Ask me anything about MSME financial health scores, loan products, GST compliance, or credit improvement strategies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await sendChat(msg, scoreContext);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      const detail = e?.response?.data?.detail || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${detail}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="AI Assistant"
        style={{
          position: "fixed",
          bottom: liftForNav ? 86 : 28,
          right: liftForNav ? 18 : 28,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: open
            ? "var(--c-surface-2)"
            : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          boxShadow: open ? "none" : "0 4px 24px #3b82f655",
          zIndex: 1000,
          transition: "all 0.2s",
        }}
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: liftForNav ? 150 : 94,
          right: liftForNav ? 12 : 28,
          width: "min(360px, calc(100vw - 24px))",
          height: liftForNav ? "min(520px, calc(100vh - 200px))" : 520,
          background: "var(--c-bg)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          zIndex: 999,
          boxShadow: "0 24px 64px #00000066",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--c-border-soft)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--c-bg)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>✦</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>FinHealth AI Assistant</div>
              <div style={{ fontSize: 10, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Online
                {scoreContext && (
                  <span style={{ color: "#475569", marginLeft: 4 }}>
                    • Context: {scoreContext.business_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 6px",
            display: "flex",
            flexDirection: "column",
          }}>
            {messages.map((m, i) => <Message key={i} msg={m} />)}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>✦</div>
                <div style={{
                  padding: "10px 14px",
                  background: "var(--c-surface)", border: "1px solid var(--c-border)",
                  borderRadius: "16px 16px 16px 4px",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#3b82f6",
                      animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (shown only on first message) */}
          {messages.length === 1 && (
            <div style={{
              padding: "0 14px 10px",
              display: "flex", flexWrap: "wrap", gap: 6,
            }}>
              {SUGGESTIONS.slice(0, scoreContext ? 4 : 3).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    padding: "5px 10px",
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    borderRadius: 20,
                    color: "#94a3b8",
                    fontSize: 11,
                    cursor: "pointer",
                    textAlign: "left",
                    lineHeight: 1.4,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 14px 14px",
            borderTop: "1px solid var(--c-border-soft)",
            display: "flex", gap: 8,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about this score…"
              rows={1}
              style={{
                flex: 1,
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: 12,
                padding: "10px 14px",
                color: "var(--c-text)",
                fontSize: 13,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.4,
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40,
                borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                  : "var(--c-surface)",
                border: "1px solid var(--c-border)",
                color: input.trim() && !loading ? "#fff" : "#475569",
                fontSize: 16,
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
