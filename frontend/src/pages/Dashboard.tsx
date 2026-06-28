import axios from "axios";
import { useState, useRef, useEffect, useCallback } from "react";

const QUICK_QUESTIONS = [
  "How do I calculate my GPA?",
  "What are graduation requirements?",
  "How do I register for courses?",
  "Can I appeal a grade?",
  "How do I apply for a scholarship?",
  "What is the add/drop deadline?",
];

const MOCK_SESSIONS = [
  { id: 1, title: "GPA & Credit Hours", date: "Today" },
  { id: 2, title: "Course Registration Help", date: "Yesterday" },
  { id: 3, title: "Graduation Checklist", date: "Jun 24" },
];

const INITIAL_MESSAGES = [
  {
    id: 0,
    role: "advisor",
    text: "Hi there! I'm your Academic Advisor. I can help you with GPA calculations, course registration, graduation requirements, and anything else university-related. What's on your mind?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

function AdvisorAvatar({ size = "md" }) {
  const sz = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-150 flex items-center gap-1 text-[11px]"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span className="text-emerald-500 font-medium">Copied</span>
        </>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  );
}

function ThumbsUp({ onLike, liked }) {
  return (
    <button
      onClick={onLike}
      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-150 ${liked ? "text-indigo-500" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
    </button>
  );
}

function Message({ msg, onLike }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2.5 mb-5 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animation: "fadeUp 0.25s ease-out" }}
    >
      {!isUser && <AdvisorAvatar />}
      <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && (
          <span className="text-[11px] font-medium text-indigo-500 mb-1 ml-1">Academic Advisor</span>
        )}
        <div className={`relative px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-[18px] rounded-br-[4px] shadow-lg shadow-indigo-500/20"
            : "bg-white text-slate-700 border border-slate-100 rounded-[18px] rounded-bl-[4px] shadow-sm"
        }`}>
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[11px] text-slate-400">{msg.time}</span>
          {!isUser && (
            <>
              <CopyButton text={msg.text} />
              <ThumbsUp onLike={() => onLike(msg.id)} liked={msg.liked} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
      <AdvisorAvatar />
      <div className="bg-white border border-slate-100 rounded-[18px] rounded-bl-[4px] px-5 py-4 shadow-sm">
        <div className="flex gap-1.5 items-center h-3.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce block" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScrollToBottom({ show, onClick }) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 right-6 w-9 h-9 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-indigo-100 transition-all duration-200"
      style={{ animation: "fadeUp 0.2s ease-out" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

export default function Dashboard() {
  const [command, setCommand] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("quick"); // "quick" | "history"
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [command]);

  // Show scroll-to-bottom button
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const sendMessage = async (text) => {
    const content = (text || command).trim();
    if (!content || loading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setCommand("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", { message: content });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "advisor",
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        liked: false,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "advisor",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        liked: false,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    setActiveSession(null);
  };

  const charCount = command.length;
  const charLimit = 500;
  const nearLimit = charCount > charLimit * 0.8;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="min-h-screen flex bg-slate-100 font-sans">

        {/* ── Sidebar ── */}
        <aside className="w-72 flex-shrink-0 flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-r border-white/5">

          {/* Brand */}
          <div className="px-5 pt-7 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Academic Advisor</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
                  <span className="text-emerald-400 text-[11px]">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Chat */}
          <div className="px-4 mb-4">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-all duration-150"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Chat
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 mb-3">
            <div className="flex bg-white/5 rounded-lg p-0.5">
              {[["quick", "Quick"], ["history", "History"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSidebarTab(val)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    sidebarTab === val
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto sidebar-scroll px-4 pb-4">
            {sidebarTab === "quick" ? (
              <div className="flex flex-col gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-300 hover:text-white text-[13px] text-left transition-all duration-150 leading-snug"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {MOCK_SESSIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSession(s.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 ${
                      activeSession === s.id
                        ? "bg-indigo-500/20 border border-indigo-500/30 text-white"
                        : "hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <p className="text-[13px] font-medium truncate">{s.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.date}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="px-4 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                MT
              </div>
              <div className="min-w-0">
                <p className="text-white text-[13px] font-medium truncate">MTZ</p>
                <p className="text-slate-500 text-[11px] truncate">Student · Semester 6</p>
              </div>
              <button className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
            <div>
              <h1 className="text-[17px] font-semibold text-slate-900 tracking-tight">Student Academic Advisor</h1>
              <p className="text-[12.5px] text-slate-400 mt-0.5">GPA · Course Registration · Graduation Requirements · University Info</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {["GPA", "Courses", "Graduation"].map(tag => (
                  <span key={tag} className="bg-indigo-50 text-indigo-600 text-[11.5px] font-medium px-2.5 py-1 rounded-lg border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button className="w-8 h-8 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="chat-scroll flex-1 overflow-y-auto px-8 py-7 bg-slate-50 relative"
          >
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium">Today</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {messages.map(msg => (
              <Message key={msg.id} msg={msg} onLike={handleLike} />
            ))}
            {loading && <TypingDots />}
            <div ref={bottomRef} />

            <ScrollToBottom show={showScrollBtn} onClick={scrollToBottom} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-100 px-8 py-4 flex-shrink-0">
            <div className="flex gap-3 items-end bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-3 py-3 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200 shadow-sm">
              <textarea
                ref={textareaRef}
                value={command}
                onChange={e => setCommand(e.target.value.slice(0, charLimit))}
                onKeyDown={handleKey}
                placeholder="Ask any academic question…"
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed overflow-hidden pt-0.5 font-sans"
                style={{ minHeight: "24px", maxHeight: "120px" }}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {nearLimit && (
                  <span className={`text-[11px] font-medium ${charCount >= charLimit ? "text-red-400" : "text-amber-400"}`}>
                    {charLimit - charCount}
                  </span>
                )}
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !command.trim()}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-150"
                >
                  {loading ? (
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[11px] text-slate-400">Enter to send · Shift + Enter for new line</p>
              <p className="text-[11px] text-slate-300">{charCount}/{charLimit}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}