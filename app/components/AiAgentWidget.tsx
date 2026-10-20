"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Phone,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  User,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  isCallbackRecorded?: boolean;
}

export default function AiAgentWidget({
  kameshPhone = "+91 63824 86456",
  kameshEmail = "mrkamesh8@gmail.com",
}: {
  kameshPhone?: string;
  kameshEmail?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCallbackInput, setShowCallbackInput] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-agent-msg",
      sender: "agent",
      text: `👋 **Hi there! I am Kamesh's Autonomous AI Representative.**\n\nIf Kamesh is currently coding in his IDE or unable to answer calls directly, I am active 24/7 to assist you!\n\n• Ask me about his **GoJobSync.com** solo architecture\n• Inquire about his **Full-Time / Freelance availability**\n• Or tap below to request an **urgent call-back** directly from Kamesh!`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          history: messages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text: data.reply || "I am here to help you connect with Kamesh!",
          timestamp: "Just now",
          isCallbackRecorded: data.isCallbackRecorded,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "agent",
            text: `I'm having a brief connection issue. You can reach Kamesh directly by phone at **${kameshPhone}** or email at **${kameshEmail}**.`,
            timestamp: "Just now",
          },
        ]);
      }
    } catch (err) {
      console.error("Agent error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "agent",
          text: `You can reach Kamesh directly at **${kameshPhone}** or **${kameshEmail}**.`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Submit urgent callback
  const handleUrgentCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    setIsTyping(true);
    setShowCallbackInput(false);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Urgent callback request for phone number: ${callbackPhone}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `cb-${Date.now()}`,
            sender: "agent",
            text: data.reply,
            timestamp: "Just now",
            isCallbackRecorded: true,
          },
        ]);
        setCallbackSent(true);
        setTimeout(() => setCallbackSent(false), 5000);
      }
    } catch {
      // fallback
    } finally {
      setIsTyping(false);
      setCallbackPhone("");
    }
  };

  const quickPills = [
    { label: "🚀 About GoJobSync", query: "Tell me how GoJobSync was built" },
    { label: "💼 Is Kamesh available?", query: "Is Kamesh open for full-time roles?" },
    { label: "📞 Request Urgent Call-back", query: "Can Kamesh call me back?" },
    { label: "🛠️ Tech Stack", query: "What is Kamesh's primary tech stack and skills?" },
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        className="ai-agent-launcher"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9990,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              className="ai-agent-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                padding: "12px 18px",
                borderRadius: 999,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={18} color="#10b981" />
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: -1,
                    right: -1,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                  }}
                />
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                  Kamesh AI Agent
                </div>
                <div style={{ fontSize: 10.5, color: "#10b981", fontWeight: 600 }}>
                  ● 24/7 Auto-Responder
                </div>
              </div>

              {unreadCount > 0 && (
                <span
                  style={{
                    background: "var(--accent-amber)",
                    color: "#ffffff",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "2px 6px",
                    marginLeft: 2,
                  }}
                >
                  1
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating Chat Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="ai-agent-modal"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 390,
                maxWidth: "calc(100vw - 32px)",
                height: 560,
                maxHeight: "calc(100vh - 100px)",
                background: "#ffffff",
                borderRadius: 20,
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.08)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                zIndex: 9999,
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  padding: "16px 18px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      position: "relative",
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1.5px solid #10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot size={20} color="#10b981" />
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #0f172a",
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14 }}>
                        Kamesh AI Representative
                      </span>
                      <span style={{ fontSize: 9.5, background: "rgba(16, 185, 129, 0.25)", color: "#34d399", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        Live
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Active when Kamesh is away on call
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <a
                    href={`tel:${kameshPhone.replace(/\s+/g, "")}`}
                    title="Direct Phone Call"
                    style={{
                      color: "#ffffff",
                      background: "rgba(255, 255, 255, 0.1)",
                      padding: 6,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={14} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: "#94a3b8",
                      background: "transparent",
                      border: "none",
                      padding: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Call-back Banner */}
              <div
                style={{
                  background: "#f0fdf4",
                  borderBottom: "1px solid #bbf7d0",
                  padding: "8px 14px",
                  fontSize: 11.5,
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={13} color="#059669" />
                  <span>Call not answered? Request a callback:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCallbackInput(!showCallbackInput)}
                  style={{
                    color: "#059669",
                    fontWeight: 700,
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  {showCallbackInput ? "Hide" : "Enter Phone"}
                </button>
              </div>

              {/* Quick Urgent Callback Drawer */}
              {showCallbackInput && (
                <form
                  onSubmit={handleUrgentCallbackSubmit}
                  style={{
                    background: "#ffffff",
                    borderBottom: "1px solid var(--border-subtle)",
                    padding: "10px 14px",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Your Phone / WhatsApp Number..."
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--border-subtle)",
                      fontSize: 12,
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ fontSize: 11, padding: "7px 12px" }}
                  >
                    Notify Kamesh
                  </button>
                </form>
              )}

              {/* Chat Messages Body */}
              <div
                style={{
                  flex: 1,
                  padding: "14px 14px 8px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "#f8fafc",
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "86%",
                        padding: "10px 14px",
                        borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: msg.sender === "user" ? "var(--accent-slate)" : "#ffffff",
                        color: msg.sender === "user" ? "#ffffff" : "var(--text-main)",
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        boxShadow: msg.sender === "user" ? "none" : "0 2px 8px rgba(15, 23, 42, 0.05)",
                        border: msg.sender === "user" ? "none" : "1px solid var(--border-subtle)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {/* Formatted rendering */}
                      {msg.text.split("\n").map((line, idx) => {
                        // Bold formatting
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={idx} style={{ minHeight: line.trim() ? "auto" : 8 }}>
                            {parts.map((p, i) => {
                              if (p.startsWith("**") && p.endsWith("**")) {
                                return (
                                  <strong key={i} style={{ color: msg.sender === "user" ? "#ffffff" : "var(--text-heading)" }}>
                                    {p.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={i}>{p}</span>;
                            })}
                          </div>
                        );
                      })}

                      {msg.isCallbackRecorded && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "6px 8px",
                            background: "#ecfdf5",
                            color: "#047857",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CheckCircle size={14} />
                          <span>Dispatched to Kamesh's Notification Inbox</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#ffffff", borderRadius: 12, width: "fit-content", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Kamesh AI Agent is typing...</span>
                    <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Pills */}
              <div
                style={{
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {quickPills.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(p.query)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#f1f5f9",
                      color: "var(--text-heading)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ffffff",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  className="ai-agent-input"
                  placeholder="Ask a question or enter your phone..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    fontSize: 12.5,
                    fontFamily: "var(--font-body)",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isTyping}
                  style={{
                    background: inputVal.trim() ? "var(--accent-emerald)" : "#e2e8f0",
                    color: "#ffffff",
                    border: "none",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: inputVal.trim() ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
