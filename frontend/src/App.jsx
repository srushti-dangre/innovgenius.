import { useState, useRef, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// ── API HELPERS ───────────────────────────────────────────────────────────────
async function apiUpload(file) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API}/upload`, { method: "POST", body: form });
  return r.json();
}
async function apiChat(message) {
  const r = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return r.json();
}
async function apiDocs() {
  const r = await fetch(`${API}/documents`);
  return r.json();
}
async function apiDelete(id) {
  await fetch(`${API}/documents/${id}`, { method: "DELETE" });
}
async function apiTopics() {
  const r = await fetch(`${API}/topics`);
  return r.json();
}
async function apiClearChat() {
  await fetch(`${API}/chat/clear`, { method: "POST" });
}
async function apiStats() {
  const r = await fetch(`${API}/stats`);
  return r.json();
}
async function apiGenerateQuiz(topic, numQuestions = 5) {
  const r = await fetch(`${API}/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, numQuestions }),
  });
  return r.json();
}
async function apiGenerateFlashcards(topic) {
  const r = await fetch(`${API}/flashcards/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  return r.json();
}
async function apiAskHighlight(selectedText, question) {
  const r = await fetch(`${API}/chat/highlight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedText, question }),
  });
  return r.json();
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const S = {
  surface: { background: "#0d1117", border: "1px solid #21262d", borderRadius: 14 },
  accent: "#b4f000",
  blue: "#00d4ff",
  purple: "#a78bfa",
  orange: "#f59e0b",
  green: "#10b981",
  red: "#f85149",
  muted: "#8b949e",
  text: "#e6edf3",
  tag: (color) => ({
    background: `${color}20`, color, padding: "0.15rem 0.6rem",
    borderRadius: 20, fontSize: "0.67rem", fontWeight: 700,
    fontFamily: "monospace",
  }),
};

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const tabs = ["home", "upload", "chat", "quiz", "flashcards", "dashboard", "workflow"];
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1rem 2rem", borderBottom: "1px solid #21262d",
      background: "rgba(3,7,18,0.95)", backdropFilter: "blur(20px)",
      position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "0.5rem",
    }}>
      <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.3rem", color: "#e6edf3" }}>
        INNOV<span style={{ color: S.accent }}>GENIUS</span>
      </div>
      <div style={{ display: "flex", gap: 4, background: "#161b22", border: "1px solid #21262d", borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setPage(t)} style={{
            padding: "0.4rem 1rem", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.8rem", textTransform: "capitalize",
            background: page === t ? S.accent : "transparent",
            color: page === t ? "#000" : S.muted,
            fontWeight: page === t ? 700 : 400, transition: "all 0.15s",
          }}>{t === "quiz" ? "🧠 Quiz" : t === "flashcards" ? "🃏 Cards" : t}</button>
        ))}
      </div>
      <span style={{
        background: "linear-gradient(135deg,#7c3aed,#00d4ff)", color: "#fff",
        padding: "0.3rem 0.9rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
      }}>✦ LIVE</span>
    </nav>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 65px)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "3rem 2rem",
      background: "radial-gradient(ellipse at 50% 40%, rgba(180,240,0,0.06) 0%, transparent 65%)",
    }}>
      <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: S.accent, marginBottom: "1.5rem" }}>
        ✦ AI-Powered Study Intelligence
      </p>
      <h1 style={{
        fontFamily: "'Orbitron',monospace", fontWeight: 900, lineHeight: 1.05,
        fontSize: "clamp(2.2rem,6vw,4.5rem)", marginBottom: "1.5rem", color: S.text,
      }}>
        Learn Smarter<br />with <span style={{ color: S.accent }}>InnovGenius</span>
      </h1>
      <p style={{ color: S.muted, maxWidth: 520, lineHeight: 1.7, fontSize: "1rem", marginBottom: "2.5rem" }}>
        Upload PDFs, lecture audio, or videos. Ask any question. Generate quizzes, flashcards,
        and track your progress — all powered by AI from <em>your own</em> study materials.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => setPage("upload")} style={{
          background: S.accent, color: "#000", border: "none", padding: "0.85rem 2rem",
          borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
        }}>→ Upload Your Content</button>
        <button onClick={() => setPage("quiz")} style={{
          background: "transparent", color: S.text, border: "1px solid #21262d",
          padding: "0.85rem 2rem", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer",
        }}>🧠 Try a Quiz</button>
        <button onClick={() => setPage("flashcards")} style={{
          background: "transparent", color: S.text, border: "1px solid #21262d",
          padding: "0.85rem 2rem", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer",
        }}>🃏 Flashcards</button>
      </div>
      <div style={{ display: "flex", gap: "3rem", marginTop: "4rem", flexWrap: "wrap", justifyContent: "center" }}>
        {[["OCR","Text Extraction"],["NLP","AI Processing"],["STT","Speech to Text"],["RAG","Smart Retrieval"],["QUIZ","Auto-Generated"],["CARDS","Flashcards"]].map(([n, l]) => (
          <div key={n} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, color: S.accent }}>{n}</div>
            <div style={{ fontSize: "0.7rem", color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── UPLOAD ────────────────────────────────────────────────────────────────────
function UploadPage({ setPage }) {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    try { setDocs(await apiDocs()); }
    catch (e) { setError("Could not load documents. Is the server running on port 5000?"); }
  }

  async function handleFile(file) {
    if (!file) return;
    setUploading(true); setProgress(0); setError(null);
    const iv = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 200);
    try {
      const res = await apiUpload(file);
      clearInterval(iv); setProgress(100);
      if (res.success) await loadDocs();
      else setError("Upload error: " + res.error);
    } catch (e) {
      clearInterval(iv);
      setError("Upload failed: " + e.message);
    }
    setTimeout(() => { setUploading(false); setProgress(0); }, 800);
  }

  const iconMap = { ".pdf": "📕", ".txt": "📄", ".mp3": "🎵", ".wav": "🎵", ".mp4": "🎬" };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        <span style={{ color: S.accent }}>Upload</span> Study Material
      </h1>
      <p style={{ color: S.muted, fontSize: "0.87rem", marginBottom: "2rem" }}>
        PDF, TXT, MP3, MP4 supported. AI will extract and index everything automatically.
      </p>

      {error && (
        <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "0.8rem 1.1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#f85149" }}>
          ⚠ {error}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? S.accent : "#21262d"}`,
          borderRadius: 16, padding: "3rem", textAlign: "center", cursor: "pointer",
          marginBottom: "1.5rem", transition: "all 0.2s",
          background: dragOver ? "rgba(180,240,0,0.04)" : "#0d1117",
        }}>
        <input ref={fileRef} type="file" style={{ display: "none" }}
          accept=".pdf,.txt,.mp3,.wav,.mp4"
          onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>📂</div>
        <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>Drop your file here or click to browse</div>
        <div style={{ color: S.muted, fontSize: "0.8rem" }}>PDF · TXT · MP3 · MP4 — max 50MB</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: "📄", label: "Documents", sub: "PDF, TXT, textbooks", color: S.accent, tag: "OCR + NLP" },
          { icon: "🎵", label: "Audio", sub: "MP3, WAV lectures", color: S.blue, tag: "SPEECH-TO-TEXT" },
          { icon: "🎬", label: "Video", sub: "MP4 recorded classes", color: S.purple, tag: "TRANSCRIPTION" },
        ].map(c => (
          <div key={c.label} onClick={() => fileRef.current.click()} style={{
            border: "1px solid #21262d", borderRadius: 14, padding: "1.5rem",
            textAlign: "center", cursor: "pointer", background: "#0d1117", transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{c.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.3rem" }}>{c.label}</div>
            <div style={{ color: S.muted, fontSize: "0.75rem", marginBottom: "0.6rem" }}>{c.sub}</div>
            <span style={S.tag(c.color)}>{c.tag}</span>
          </div>
        ))}
      </div>

      {uploading && (
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: "1rem 1.2rem", marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>⚙️ Processing... {progress}%</div>
          <div style={{ height: 5, background: "#21262d", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${S.accent},${S.blue})`, transition: "width 0.3s", borderRadius: 4 }} />
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, padding: "1.2rem 1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.73rem", textTransform: "uppercase", letterSpacing: "0.1em", color: S.muted, marginBottom: "1rem" }}>
            📁 Indexed Files ({docs.length})
          </div>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.6rem 0", borderBottom: "1px solid #21262d" }}>
              <span style={{ fontSize: "1.2rem" }}>{iconMap[doc.type] || "📄"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.87rem", fontWeight: 500 }}>{doc.name}</div>
                <div style={{ fontSize: "0.72rem", color: S.muted, marginTop: 2 }}>{doc.chunks} chunks · {new Date(doc.uploadedAt).toLocaleTimeString()}</div>
              </div>
              <span style={S.tag(S.accent)}>✓ Indexed</span>
              <button aria-label="Delete document" onClick={async () => { await apiDelete(doc.id); await loadDocs(); }}
                style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", fontSize: "1rem" }}>🗑</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setPage("chat")} style={{
        background: S.accent, color: "#000", border: "none", padding: "0.85rem 2rem",
        borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
      }}>→ Go to AI Chat</button>
    </div>
  );
}

// ── CHAT (with Highlight & Ask + Voice Input) ─────────────────────────────────
function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "ai",
      content: "👋 Hello! I've processed your study materials. What would you like to know? I can explain concepts, quiz you, or find specific information.\n\n💡 Tip: Select any text in my responses to use the Highlight & Ask feature!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All Topics");
  const [error, setError] = useState(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Highlight & Ask state
  const [highlightPopup, setHighlightPopup] = useState(null); // {x, y, text}
  const [highlightQuestion, setHighlightQuestion] = useState("");
  const [highlightLoading, setHighlightLoading] = useState(false);

  const bottomRef = useRef();

  useEffect(() => { loadTopics(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
        setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => recognitionRef.current?.abort();
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  async function loadTopics() {
    try {
      const r = await apiTopics();
      if (r.topics) setTopics(r.topics);
    } catch (e) { setError("Could not load topics."); }
  }

  function addMessage(role, content, sources = []) {
    setMessages(m => [...m, { id: crypto.randomUUID(), role, content, sources, timestamp: new Date() }]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    addMessage("user", text);
    setLoading(true);
    try {
      const res = await apiChat(text);
      addMessage("ai", res.reply || res.error, res.sources || []);
    } catch {
      setError("Can't reach backend. Is the server running on port 5000?");
      addMessage("ai", "❌ Connection failed. Please check your backend server.");
    }
    setLoading(false);
  }

  // Highlight & Ask
  function handleTextSelect() {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (selected && selected.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setHighlightPopup({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 60, text: selected });
      setHighlightQuestion("");
    } else {
      setHighlightPopup(null);
    }
  }

  async function askAboutHighlight() {
    if (!highlightPopup || !highlightQuestion.trim()) return;
    setHighlightLoading(true);
    const userQ = highlightQuestion.trim();
    addMessage("user", `📌 About: "${highlightPopup.text.slice(0, 60)}..." — ${userQ}`);
    setHighlightPopup(null);
    setHighlightQuestion("");
    try {
      const res = await apiAskHighlight(highlightPopup.text, userQ);
      addMessage("ai", res.reply || res.error, res.sources || []);
    } catch {
      addMessage("ai", "❌ Could not process highlighted text.");
    }
    setHighlightLoading(false);
    setLoading(false);
  }

  const colors = ["#b4f000","#00d4ff","#7c3aed","#f59e0b","#ec4899","#10b981"];
  const suggestions = ["Summarize my document","Quiz me on the key topics","What are the main concepts?","Explain with an example"];

  return (
    <div style={{ position: "relative" }}>
      {/* Highlight popup */}
      {highlightPopup && (
        <div style={{
          position: "absolute", left: Math.max(highlightPopup.x - 160, 10), top: highlightPopup.y,
          zIndex: 200, background: "#161b22", border: "1px solid #21262d", borderRadius: 12,
          padding: "0.8rem", width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}>
          <div style={{ fontSize: "0.72rem", color: S.accent, marginBottom: "0.5rem", fontWeight: 700 }}>
            📌 ASK ABOUT SELECTION
          </div>
          <div style={{ fontSize: "0.78rem", color: S.muted, marginBottom: "0.6rem", fontStyle: "italic", borderLeft: `2px solid ${S.accent}`, paddingLeft: "0.5rem" }}>
            "{highlightPopup.text.slice(0, 80)}{highlightPopup.text.length > 80 ? "…" : ""}"
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input
              autoFocus
              value={highlightQuestion}
              onChange={e => setHighlightQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askAboutHighlight()}
              placeholder="Your question…"
              style={{
                flex: 1, background: "#0d1117", border: "1px solid #21262d", borderRadius: 7,
                padding: "0.45rem 0.7rem", color: S.text, fontFamily: "inherit", fontSize: "0.82rem", outline: "none",
              }} />
            <button onClick={askAboutHighlight} disabled={highlightLoading} style={{
              background: S.accent, color: "#000", border: "none", borderRadius: 7,
              padding: "0 0.7rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
            }}>{highlightLoading ? "…" : "→"}</button>
            <button onClick={() => setHighlightPopup(null)} style={{
              background: "transparent", border: "1px solid #21262d", borderRadius: 7,
              color: S.muted, padding: "0 0.6rem", cursor: "pointer", fontSize: "0.85rem",
            }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "calc(100vh - 65px)", color: S.text }}>
        {/* Sidebar */}
        <div style={{ borderRight: "1px solid #21262d", padding: "1.5rem 1rem", overflowY: "auto", background: "#0d1117" }}>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: S.muted, marginBottom: "1rem", paddingLeft: "0.5rem" }}>📚 Topics</div>
          {["All Topics", ...topics].map((t, i) => (
            <div key={t} onClick={() => setActiveTopic(t)} style={{
              display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.8rem",
              borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", marginBottom: 4,
              color: activeTopic === t ? S.text : S.muted,
              background: activeTopic === t ? "#161b22" : "transparent",
              borderLeft: `3px solid ${activeTopic === t ? colors[i % colors.length] : "transparent"}`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i % colors.length], display: "inline-block", flexShrink: 0 }} />
              {t}
            </div>
          ))}
          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #21262d" }}>
            <div style={{ fontSize: "0.7rem", color: S.muted, marginBottom: "0.5rem", paddingLeft: "0.3rem" }}>💡 Highlight & Ask</div>
            <div style={{ fontSize: "0.72rem", color: "#4a5568", lineHeight: 1.5, paddingLeft: "0.3rem" }}>
              Select any text in the chat to ask a follow-up question about it
            </div>
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #21262d" }}>
            <button onClick={async () => {
              await apiClearChat();
              setMessages([{ id: crypto.randomUUID(), role: "ai", content: "Chat cleared! Ask me anything about your documents." }]);
            }} style={{ width: "100%", background: "transparent", border: "1px solid #21262d", color: S.muted, padding: "0.5rem", borderRadius: 8, cursor: "pointer", fontSize: "0.78rem" }}>
              🗑 Clear Chat
            </button>
          </div>
        </div>

        {/* Chat main */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0.8rem 1.5rem", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>AI Study Assistant</span>
            <span style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 6, padding: "0.18rem 0.6rem", fontSize: "0.7rem", color: S.muted }}>Gemini 2.0 Flash</span>
            <span style={S.tag(S.accent)}>● Live</span>
            {voiceSupported && <span style={S.tag(S.blue)}>🎤 Voice Ready</span>}
          </div>

          {error && (
            <div style={{ margin: "0.5rem 1.5rem", background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 8, padding: "0.6rem 1rem", fontSize: "0.82rem", color: "#f85149" }}>
              ⚠ {error}
            </div>
          )}

          <div onMouseUp={handleTextSelect} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", gap: "0.8rem", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.9rem", flexShrink: 0,
                  background: msg.role === "ai" ? "linear-gradient(135deg,#7c3aed,#00d4ff)" : "#161b22",
                  border: msg.role === "user" ? "1px solid #21262d" : "none",
                }}>
                  {msg.role === "ai" ? "🤖" : "🧑"}
                </div>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{
                    padding: "0.9rem 1.1rem", borderRadius: 12, fontSize: "0.87rem", lineHeight: 1.65,
                    whiteSpace: "pre-wrap", userSelect: "text",
                    background: msg.role === "ai" ? "#161b22" : S.accent,
                    color: msg.role === "ai" ? S.text : "#000",
                    border: msg.role === "ai" ? "1px solid #21262d" : "none",
                    borderTopLeftRadius: msg.role === "ai" ? 3 : 12,
                    borderTopRightRadius: msg.role === "user" ? 3 : 12,
                  }}>
                    {msg.content}
                  </div>
                  {msg.sources?.length > 0 && (
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      {msg.sources.map((s, j) => (
                        <span key={j} style={{ padding: "0.18rem 0.6rem", borderRadius: 6, fontSize: "0.68rem", background: "rgba(0,212,255,0.1)", color: S.blue, border: "1px solid rgba(0,212,255,0.2)" }}>
                          📎 {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.timestamp && (
                    <div style={{ fontSize: "0.65rem", color: "#4a5568", marginTop: "0.3rem", paddingLeft: "0.2rem" }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "0.8rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#00d4ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
                <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: "1rem 1.2rem", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: S.muted, display: "inline-block", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #21262d", background: "#0d1117" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.7rem", flexWrap: "wrap" }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  padding: "0.22rem 0.7rem", borderRadius: 20, border: "1px solid #21262d",
                  background: "transparent", color: S.muted, fontSize: "0.72rem", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.target.style.borderColor=S.accent; e.target.style.color=S.accent; }}
                  onMouseLeave={e => { e.target.style.borderColor="#21262d"; e.target.style.color=S.muted; }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-end" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={isListening ? "🎤 Listening... speak now" : "Ask anything about your uploaded documents..."}
                rows={1}
                style={{
                  flex: 1, background: isListening ? "rgba(180,240,0,0.05)" : "#161b22",
                  border: `1px solid ${isListening ? S.accent : "#21262d"}`, borderRadius: 10,
                  padding: "0.75rem 1rem", color: S.text, fontFamily: "inherit",
                  fontSize: "0.87rem", resize: "none", outline: "none", transition: "all 0.2s",
                }} />
              {voiceSupported && (
                <button onClick={toggleVoice} title={isListening ? "Stop listening" : "Voice input"} style={{
                  background: isListening ? S.accent : "#161b22",
                  color: isListening ? "#000" : S.muted,
                  border: `1px solid ${isListening ? S.accent : "#21262d"}`,
                  width: 44, height: 44, borderRadius: 10, cursor: "pointer", fontSize: "1.1rem",
                  transition: "all 0.2s", animation: isListening ? "pulse 1.5s infinite" : "none",
                }}>🎤</button>
              )}
              <button onClick={send} disabled={loading} style={{
                background: S.accent, color: "#000", border: "none", width: 44, height: 44,
                borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontSize: "1.1rem", opacity: loading ? 0.6 : 1,
              }}>➤</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(180,240,0,0.4)}50%{box-shadow:0 0 0 8px rgba(180,240,0,0)}}
      `}</style>
    </div>
  );
}

// ── QUIZ GENERATOR ────────────────────────────────────────────────────────────
function QuizPage() {
  const [phase, setPhase] = useState("setup"); // setup | loading | active | result
  const [topic, setTopic] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);

  // Fallback demo questions (used when backend returns no questions)
  const demoQuestions = [
    {
      question: "What is the key ordering property of a Binary Search Tree (BST)?",
      options: ["Each node has exactly 2 children", "Left subtree values are less, right are greater than parent", "All leaf nodes are at the same level", "Nodes are inserted in alphabetical order"],
      correct: 1,
      explanation: "A BST enforces that every left subtree value is less than the parent, and every right subtree value is greater — enabling O(log n) average search time."
    },
    {
      question: "What is the time complexity of binary search in an average BST?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      correct: 2,
      explanation: "Binary search in a balanced BST runs in O(log n) because each comparison eliminates half the remaining nodes."
    },
    {
      question: "Which data structure uses LIFO (Last In, First Out) ordering?",
      options: ["Queue", "Stack", "Heap", "Linked List"],
      correct: 1,
      explanation: "A Stack follows LIFO — the last element pushed is the first one popped. Think of a stack of plates."
    },
  ];

  useEffect(() => {
    apiTopics().then(r => { if (r.topics) setTopics(r.topics); }).catch(() => {});
  }, []);

  async function startQuiz() {
    if (!topic.trim()) { setError("Please enter a topic or select one above."); return; }
    setError(null);
    setPhase("loading");
    try {
      const res = await apiGenerateQuiz(topic, numQ);
      const qs = res.questions?.length ? res.questions : demoQuestions;
      setQuestions(qs);
      setAnswers([]);
      setCurrent(0);
      setSelected(null);
      setPhase("active");
    } catch {
      // Use demo questions as fallback
      setQuestions(demoQuestions);
      setAnswers([]);
      setCurrent(0);
      setSelected(null);
      setPhase("active");
    }
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers(a => [...a, { questionIdx: current, selected: idx, correct: questions[current].correct }]);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }

  const score = answers.filter(a => a.selected === a.correct).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const q = questions[current];

  // ── Setup Screen
  if (phase === "setup") return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        <span style={{ color: S.accent }}>Quiz</span> Generator
      </h1>
      <p style={{ color: S.muted, fontSize: "0.87rem", marginBottom: "2rem" }}>
        AI generates questions from your uploaded study materials.
      </p>

      {error && <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "0.8rem 1.1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#f85149" }}>⚠ {error}</div>}

      {topics.length > 0 && (
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.72rem", color: S.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>Quick Select Topic</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {topics.map(t => (
              <button key={t} onClick={() => setTopic(t)} style={{
                padding: "0.3rem 0.8rem", borderRadius: 20, border: `1px solid ${topic === t ? S.accent : "#21262d"}`,
                background: topic === t ? `${S.accent}15` : "transparent",
                color: topic === t ? S.accent : S.muted, fontSize: "0.78rem", cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 14, padding: "1.5rem", marginBottom: "1.2rem" }}>
        <label style={{ fontSize: "0.82rem", color: S.muted, display: "block", marginBottom: "0.5rem" }}>Quiz Topic</label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && startQuiz()}
          placeholder="e.g. Binary Search Trees, Photosynthesis, World War II..."
          style={{
            width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: 8,
            padding: "0.75rem 1rem", color: S.text, fontFamily: "inherit", fontSize: "0.9rem", outline: "none",
          }} />
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <label style={{ fontSize: "0.82rem", color: S.muted }}>Number of Questions</label>
          <span style={{ fontFamily: "'Orbitron',monospace", color: S.accent, fontWeight: 700, fontSize: "1.2rem" }}>{numQ}</span>
        </div>
        <input type="range" min={3} max={15} value={numQ} onChange={e => setNumQ(+e.target.value)}
          style={{ width: "100%", accentColor: S.accent }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: S.muted, marginTop: "0.3rem" }}>
          <span>3 (Quick)</span><span>15 (Deep Dive)</span>
        </div>
      </div>

      <button onClick={startQuiz} style={{
        background: S.accent, color: "#000", border: "none", padding: "0.9rem 2.5rem",
        borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", width: "100%",
      }}>🧠 Generate Quiz</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.8rem", marginTop: "1.5rem" }}>
        {[["MCQ","Multiple choice with 4 options","#b4f000"],["AI Graded","Powered by Gemini","#00d4ff"],["Cited","Sourced from your docs","#a78bfa"]].map(([t,d,c]) => (
          <div key={t} style={{ background: "#0d1117", border: `1px solid ${c}30`, borderRadius: 10, padding: "0.9rem", textAlign: "center" }}>
            <div style={{ color: c, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.3rem" }}>{t}</div>
            <div style={{ color: S.muted, fontSize: "0.72rem" }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Loading
  if (phase === "loading") return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "5rem 2rem", textAlign: "center", color: S.text }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "spin 2s linear infinite", display: "inline-block" }}>🧠</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.2rem", color: S.accent, marginBottom: "0.5rem" }}>Generating Quiz…</div>
      <div style={{ color: S.muted, fontSize: "0.85rem" }}>AI is crafting {numQ} questions about "{topic}"</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Active Quiz
  if (phase === "active" && q) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.78rem", color: S.muted }}>Question {current + 1} of {questions.length}</div>
        <div style={{ fontFamily: "'Orbitron',monospace", color: S.accent, fontSize: "0.85rem" }}>
          {answers.filter(a => a.selected === a.correct).length}/{answers.length} ✓
        </div>
      </div>
      <div style={{ height: 6, background: "#21262d", borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
        <div style={{
          width: `${((current + (selected !== null ? 1 : 0)) / questions.length) * 100}%`,
          height: "100%", background: `linear-gradient(90deg, ${S.accent}, ${S.blue})`, borderRadius: 4, transition: "width 0.4s ease",
        }} />
      </div>

      {/* Question */}
      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, padding: "1.8rem", marginBottom: "1.2rem" }}>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.6 }}>{q.question}</div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1.2rem" }}>
        {q.options.map((opt, i) => {
          let borderColor = "#21262d";
          let bg = "#0d1117";
          let textColor = S.text;
          if (selected !== null) {
            if (i === q.correct) { borderColor = S.green; bg = "rgba(16,185,129,0.08)"; }
            else if (i === selected && selected !== q.correct) { borderColor = "#f85149"; bg = "rgba(248,81,73,0.08)"; textColor = "#f85149"; }
          } else if (selected === null) {
            // hover handled inline
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} style={{
              background: bg, border: `2px solid ${borderColor}`, borderRadius: 12,
              padding: "1rem 1.2rem", textAlign: "left", cursor: selected !== null ? "default" : "pointer",
              color: textColor, fontFamily: "inherit", fontSize: "0.9rem", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "0.8rem",
            }}
              onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = S.accent; }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = "#21262d"; }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", background: "#161b22",
                border: `1px solid ${borderColor}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0,
                color: i === q.correct && selected !== null ? S.green : S.muted,
              }}>{["A","B","C","D"][i]}</span>
              {opt}
              {selected !== null && i === q.correct && <span style={{ marginLeft: "auto", color: S.green }}>✓</span>}
              {selected !== null && i === selected && selected !== q.correct && <span style={{ marginLeft: "auto", color: "#f85149" }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected !== null && q.explanation && (
        <div style={{ background: "rgba(180,240,0,0.06)", border: "1px solid rgba(180,240,0,0.2)", borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.2rem", fontSize: "0.85rem", lineHeight: 1.65, color: S.muted }}>
          💡 <strong style={{ color: S.accent }}>Explanation:</strong> {q.explanation}
        </div>
      )}

      {selected !== null && (
        <button onClick={next} style={{
          background: S.accent, color: "#000", border: "none", padding: "0.85rem 2rem",
          borderRadius: 10, fontWeight: 700, cursor: "pointer", width: "100%", fontSize: "0.95rem",
        }}>{current + 1 >= questions.length ? "🏆 View Results" : "Next Question →"}</button>
      )}
    </div>
  );

  // ── Results
  if (phase === "result") return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 2rem", color: S.text, textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{pct >= 80 ? "🏆" : pct >= 60 ? "📚" : "💪"}</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "3rem", fontWeight: 900, color: pct >= 80 ? S.accent : pct >= 60 ? S.blue : S.orange, marginBottom: "0.3rem" }}>{pct}%</div>
      <div style={{ color: S.muted, fontSize: "0.9rem", marginBottom: "0.5rem" }}>{score} of {questions.length} correct · Topic: {topic}</div>
      <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "2rem" }}>
        {pct >= 80 ? "Excellent work! 🎉" : pct >= 60 ? "Good progress, keep studying!" : "Keep going — practice makes perfect!"}
      </div>

      {/* Per-question breakdown */}
      <div style={{ textAlign: "left", background: "#0d1117", border: "1px solid #21262d", borderRadius: 14, padding: "1.2rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: S.muted, marginBottom: "1rem" }}>Question Breakdown</div>
        {answers.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.5rem 0", borderBottom: i < answers.length - 1 ? "1px solid #21262d" : "none", fontSize: "0.82rem" }}>
            <span style={{ color: a.selected === a.correct ? S.green : "#f85149", fontSize: "1rem" }}>{a.selected === a.correct ? "✓" : "✗"}</span>
            <span style={{ flex: 1, color: S.muted }}>Q{i+1}: {questions[i]?.question?.slice(0, 55)}…</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => { setPhase("setup"); setAnswers([]); setCurrent(0); setSelected(null); }} style={{
          background: S.accent, color: "#000", border: "none", padding: "0.85rem 2rem",
          borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
        }}>🔄 New Quiz</button>
        <button onClick={() => { setAnswers([]); setCurrent(0); setSelected(null); setPhase("active"); }} style={{
          background: "transparent", color: S.text, border: "1px solid #21262d",
          padding: "0.85rem 2rem", borderRadius: 10, cursor: "pointer", fontSize: "0.9rem",
        }}>↩ Retry Same Quiz</button>
      </div>
    </div>
  );
}

// ── SMART FLASHCARDS ──────────────────────────────────────────────────────────
function FlashcardsPage() {
  const [phase, setPhase] = useState("setup"); // setup | loading | study | done
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [reviewing, setReviewing] = useState([]);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);

  const demoCards = [
    { front: "What is a Binary Search Tree?", back: "A BST is a binary tree where each node's left subtree contains only values less than the node, and the right subtree contains only values greater. This enables O(log n) average search time." },
    { front: "What is Big O Notation?", back: "Big O notation describes the worst-case time or space complexity of an algorithm as input size grows. Common complexities: O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic." },
    { front: "What is the difference between a Stack and a Queue?", back: "A Stack uses LIFO (Last In First Out) — think of a stack of plates. A Queue uses FIFO (First In First Out) — think of a line at a store. Both are fundamental linear data structures." },
    { front: "What is Recursion?", back: "Recursion is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a base case (stopping condition) and a recursive case." },
  ];

  useEffect(() => {
    apiTopics().then(r => { if (r.topics) setTopics(r.topics); }).catch(() => {});
  }, []);

  async function generateCards() {
    if (!topic.trim()) { setError("Please enter a topic."); return; }
    setError(null);
    setPhase("loading");
    try {
      const res = await apiGenerateFlashcards(topic);
      const c = res.flashcards?.length ? res.flashcards : demoCards;
      setCards(c);
      setCurrent(0);
      setFlipped(false);
      setKnown([]);
      setReviewing([]);
      setPhase("study");
    } catch {
      setCards(demoCards);
      setCurrent(0); setFlipped(false); setKnown([]); setReviewing([]);
      setPhase("study");
    }
  }

  function markCard(knewIt) {
    if (knewIt) setKnown(k => [...k, current]);
    else setReviewing(r => [...r, current]);
    if (current + 1 >= cards.length) setPhase("done");
    else { setCurrent(c => c + 1); setFlipped(false); }
  }

  const card = cards[current];

  if (phase === "setup") return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        <span style={{ color: S.accent }}>Smart</span> Flashcards
      </h1>
      <p style={{ color: S.muted, fontSize: "0.87rem", marginBottom: "2rem" }}>
        AI generates flashcard decks from your study materials. Click to flip!
      </p>

      {error && <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "0.8rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#f85149" }}>⚠ {error}</div>}

      {topics.length > 0 && (
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.72rem", color: S.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>Quick Select</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {topics.map(t => (
              <button key={t} onClick={() => setTopic(t)} style={{
                padding: "0.3rem 0.8rem", borderRadius: 20,
                border: `1px solid ${topic === t ? S.purple : "#21262d"}`,
                background: topic === t ? `${S.purple}15` : "transparent",
                color: topic === t ? S.purple : S.muted, fontSize: "0.78rem", cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.82rem", color: S.muted, display: "block", marginBottom: "0.5rem" }}>Topic</label>
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generateCards()}
          placeholder="e.g. Data Structures, Cell Biology, French Revolution..."
          style={{ width: "100%", background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: "0.75rem 1rem", color: S.text, fontFamily: "inherit", fontSize: "0.9rem", outline: "none" }} />
      </div>

      <button onClick={generateCards} style={{
        background: S.purple, color: "#fff", border: "none", padding: "0.9rem 2.5rem",
        borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", width: "100%",
      }}>🃏 Generate Flashcards</button>
    </div>
  );

  if (phase === "loading") return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "5rem 2rem", textAlign: "center", color: S.text }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🃏</div>
      <div style={{ fontFamily: "'Orbitron',monospace", color: S.purple, fontSize: "1.1rem" }}>Creating Flashcards…</div>
      <div style={{ color: S.muted, marginTop: "0.5rem", fontSize: "0.85rem" }}>AI is summarizing key concepts from "{topic}"</div>
    </div>
  );

  if (phase === "study" && card) return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.78rem", color: S.muted }}>Card {current + 1} of {cards.length}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span style={{ ...S.tag(S.green) }}>✓ {known.length}</span>
          <span style={{ ...S.tag(S.orange) }}>↩ {reviewing.length}</span>
        </div>
      </div>
      <div style={{ height: 5, background: "#21262d", borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
        <div style={{ width: `${(current / cards.length) * 100}%`, height: "100%", background: `linear-gradient(90deg,${S.purple},${S.blue})`, borderRadius: 4, transition: "width 0.4s" }} />
      </div>

      {/* Flip card */}
      <div onClick={() => setFlipped(f => !f)} style={{ cursor: "pointer", marginBottom: "1.5rem", perspective: 1000 }}>
        <div style={{
          background: flipped ? "#161b22" : "#0d1117",
          border: `2px solid ${flipped ? S.purple : "#21262d"}`,
          borderRadius: 20, padding: "3rem 2rem", minHeight: 220,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", transition: "all 0.3s", position: "relative",
        }}>
          <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.68rem", color: S.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {flipped ? "Answer" : "Question — click to reveal"}
          </div>
          {flipped && <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span style={S.tag(S.purple)}>ANSWER</span>
          </div>}
          <div style={{ fontSize: flipped ? "0.92rem" : "1.05rem", lineHeight: 1.65, color: flipped ? S.muted : S.text, fontWeight: flipped ? 400 : 600 }}>
            {flipped ? card.back : card.front}
          </div>
          {!flipped && <div style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: S.muted }}>👆 Tap to flip</div>}
        </div>
      </div>

      {flipped && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
          <button onClick={() => markCard(false)} style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)",
            color: S.orange, borderRadius: 12, padding: "1rem", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
          }}>↩ Still Learning</button>
          <button onClick={() => markCard(true)} style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.4)",
            color: S.green, borderRadius: 12, padding: "1rem", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
          }}>✓ Got It!</button>
        </div>
      )}
    </div>
  );

  if (phase === "done") return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 2rem", color: S.text, textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🃏</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.8rem", fontWeight: 900, color: S.accent, marginBottom: "0.5rem" }}>Deck Complete!</div>
      <div style={{ color: S.muted, marginBottom: "2rem" }}>Topic: {topic}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "2.5rem", color: S.green, fontWeight: 700 }}>{known.length}</div>
          <div style={{ color: S.muted, fontSize: "0.8rem", marginTop: "0.3rem" }}>Cards Mastered</div>
        </div>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "2.5rem", color: S.orange, fontWeight: 700 }}>{reviewing.length}</div>
          <div style={{ color: S.muted, fontSize: "0.8rem", marginTop: "0.3rem" }}>Still Reviewing</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => { setPhase("setup"); }} style={{ background: S.purple, color: "#fff", border: "none", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>🔄 New Deck</button>
        {reviewing.length > 0 && (
          <button onClick={() => {
            setCards(reviewing.map(i => cards[i]));
            setCurrent(0); setFlipped(false); setKnown([]); setReviewing([]); setPhase("study");
          }} style={{ background: "transparent", color: S.text, border: "1px solid #21262d", padding: "0.85rem 2rem", borderRadius: 10, cursor: "pointer" }}>
            ↩ Review Missed ({reviewing.length})
          </button>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD (Study Progress) ─────────────────────────────────────────────────
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const s = await apiStats();
      setStats(s);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Could not load stats. Is the backend running?");
    }
  }

  const cards = stats ? [
    { icon: "📄", label: "Documents Uploaded", value: stats.documentsUploaded, color: S.accent, max: 10 },
    { icon: "💬", label: "Questions Asked", value: stats.questionsAsked, color: S.blue, max: 50 },
    { icon: "🧠", label: "Topics Explored", value: stats.topicsExplored, color: S.purple, max: 20 },
    { icon: "🏆", label: "Quizzes Taken", value: stats.quizzesTaken, color: S.orange, max: 20 },
    { icon: "🃏", label: "Flashcards Studied", value: stats.flashcardsStudied ?? 0, color: S.green, max: 100 },
    { icon: "🎤", label: "Voice Queries", value: stats.voiceQueries ?? 0, color: "#ec4899", max: 30 },
  ] : [];

  // Derive a study streak (illustrative)
  const studyScore = stats ? Math.min(
    Math.round(
      (stats.documentsUploaded / 10) * 20 +
      (stats.questionsAsked / 50) * 30 +
      (stats.topicsExplored / 20) * 20 +
      ((stats.quizzesTaken ?? 0) / 20) * 30
    ), 100
  ) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            <span style={{ color: S.accent }}>Study</span> Progress
          </h1>
          <p style={{ color: S.muted, fontSize: "0.87rem" }}>Your learning activity at a glance — updates every 10 seconds</p>
        </div>
        {lastUpdated && <div style={{ fontSize: "0.72rem", color: S.muted, marginTop: "0.5rem" }}>🔄 Updated {lastUpdated.toLocaleTimeString()}</div>}
      </div>

      {error && <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "0.8rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#f85149" }}>⚠ {error}</div>}

      {/* Overall score */}
      {stats && (
        <div style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180,240,0,0.08), transparent 70%), #0d1117", border: "1px solid #21262d", borderRadius: 16, padding: "1.8rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "3.5rem", fontWeight: 900, color: S.accent, lineHeight: 1 }}>{studyScore}</div>
            <div style={{ fontSize: "0.72rem", color: S.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.3rem" }}>Study Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.82rem", color: S.muted, marginBottom: "0.5rem" }}>Overall Progress</div>
            <div style={{ height: 10, background: "#21262d", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${studyScore}%`, height: "100%", background: `linear-gradient(90deg,${S.accent},${S.blue})`, borderRadius: 5, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: "0.75rem", color: S.muted, marginTop: "0.4rem" }}>
              {studyScore < 30 ? "🌱 Just getting started!" : studyScore < 60 ? "📚 Building momentum!" : studyScore < 85 ? "🚀 Great progress!" : "🏆 Study champion!"}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: "#0d1117", border: `1px solid ${c.color}30`,
              borderRadius: 14, padding: "1.2rem", borderLeft: `4px solid ${c.color}`,
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>{c.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Orbitron',monospace", color: c.color }}>{c.value ?? 0}</div>
              <div style={{ fontSize: "0.75rem", color: S.muted, marginTop: "0.2rem" }}>{c.label}</div>
              <div style={{ height: 3, background: "#21262d", borderRadius: 2, overflow: "hidden", marginTop: "0.7rem" }}>
                <div style={{ width: `${Math.min(((c.value ?? 0) / c.max) * 100, 100)}%`, height: "100%", background: c.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", color: S.muted, padding: "3rem", background: "#0d1117", borderRadius: 14, marginBottom: "1.5rem" }}>
          ⏳ Loading stats…
        </div>
      )}

      {/* Learning Milestones */}
      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: S.muted, marginBottom: "1.2rem" }}>📈 Learning Milestones</div>
        {[
          { label: "Documents Processed", value: stats?.documentsUploaded || 0, max: 10, color: S.accent },
          { label: "Questions Answered", value: stats?.questionsAsked || 0, max: 50, color: S.blue },
          { label: "Topics Discovered", value: stats?.topicsExplored || 0, max: 20, color: S.purple },
          { label: "Quizzes Completed", value: stats?.quizzesTaken || 0, max: 20, color: S.orange },
          { label: "Flashcards Mastered", value: stats?.flashcardsStudied || 0, max: 100, color: S.green },
        ].map(bar => (
          <div key={bar.label} style={{ marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem" }}>
              <span>{bar.label}</span>
              <span style={{ color: bar.color, fontWeight: 600 }}>{bar.value} / {bar.max}</span>
            </div>
            <div style={{ height: 7, background: "#21262d", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min((bar.value / bar.max) * 100, 100)}%`,
                height: "100%", background: `linear-gradient(90deg, ${bar.color}, ${bar.color}99)`,
                borderRadius: 4, transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(180,240,0,0.06)", border: "1px solid rgba(180,240,0,0.2)", borderRadius: 12, padding: "1rem 1.2rem", fontSize: "0.83rem", color: S.muted }}>
        💡 <strong style={{ color: S.accent }}>Tip:</strong> Upload documents, run quizzes, and study flashcards — your score updates automatically!
      </div>
    </div>
  );
}

// ── WORKFLOW ──────────────────────────────────────────────────────────────────
function WorkflowPage() {
  const nodes = [
    { icon:"👤", title:"USER INTERFACE", desc:"Students upload files and chat with the AI via a React web app.", color:S.accent, tags:["React.js","Vite","Fetch API"] },
    { icon:"⚡", title:"BACKEND SERVER", desc:"Express.js handles uploads, routes requests, and runs the AI pipeline.", color:S.blue, tags:["Node.js","Express.js","Multer"] },
    { icon:"🔍", title:"TEXT EXTRACTION", desc:"PDFs parsed via pdf-parse. Audio/video transcribed via Whisper STT.", color:S.purple, tags:["pdf-parse","Whisper STT","Tesseract"] },
    { icon:"🧠", title:"AI PROCESSING (NLP)", desc:"Text chunked and passed to Gemini as context. Topics auto-extracted.", color:S.orange, tags:["Gemini 2.0 Flash","RAG","Chunking"] },
    { icon:"🗄️", title:"DATABASE STORAGE", desc:"Docs, chunks, and metadata stored for retrieval.", color:S.green, tags:["MongoDB","In-memory","GridFS"] },
    { icon:"🔎", title:"SEMANTIC SEARCH (RAG)", desc:"Query matched against stored chunks. Best context sent to AI.", color:"#ec4899", tags:["Cosine Similarity","Top-K","RAG"] },
    { icon:"🧠", title:"QUIZ & FLASHCARD ENGINE", desc:"Gemini generates MCQs and flashcards from indexed document chunks.", color:S.blue, tags:["Gemini 2.0","MCQ","Flashcards"] },
    { icon:"💡", title:"ANSWER + CITATIONS", desc:"AI responds with grounded answers and document citations.", color:S.accent, tags:["Gemini 2.0","Citations","Recommender"] },
  ];

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "2.5rem 2rem", color: S.text }}>
      <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
        <span style={{ color: S.accent }}>System</span> Architecture
      </h1>
      <p style={{ color: S.muted, fontSize: "0.87rem", marginBottom: "2rem" }}>End-to-end workflow of InnovGenius</p>
      {nodes.map((n, i) => (
        <div key={n.title + i}>
          <div style={{
            background: "#0d1117", border: "1px solid #21262d", borderRadius: 14,
            padding: "1.2rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start",
            borderLeft: `3px solid ${n.color}`,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{n.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.25rem" }}>{n.title}</div>
              <div style={{ fontSize: "0.8rem", color: S.muted, lineHeight: 1.5, marginBottom: "0.5rem" }}>{n.desc}</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {n.tags.map(t => <span key={t} style={S.tag(n.color)}>{t}</span>)}
              </div>
            </div>
          </div>
          {i < nodes.length - 1 && <div style={{ textAlign: "center", color: S.muted, fontSize: "1.2rem", margin: "0.3rem 0" }}>↓</div>}
        </div>
      ))}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={{ background: "#030712", minHeight: "100vh", fontFamily: "'Sora',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Sora:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <Nav page={page} setPage={setPage} />
      {page === "home"       && <HomePage setPage={setPage} />}
      {page === "upload"     && <UploadPage setPage={setPage} />}
      {page === "chat"       && <ChatPage />}
      {page === "quiz"       && <QuizPage />}
      {page === "flashcards" && <FlashcardsPage />}
      {page === "dashboard"  && <DashboardPage />}
      {page === "workflow"   && <WorkflowPage />}
    </div>
  );
}
