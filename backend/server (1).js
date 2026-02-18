require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ── IN-MEMORY STORE ───────────────────────────────────────────────────────────
let documents = [];
let chatHistory = [];
let topicsExplored = new Set();

let statsData = {
  questionsAsked: 0,
  documentsUploaded: 0,
  quizzesTaken: 0,
  flashcardsStudied: 0,  // NEW
  voiceQueries: 0,       // NEW
};

// ── MULTER ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ── HELPER: get context from uploaded documents ───────────────────────────────
function getChunksForTopic(topic) {
  if (documents.length === 0) {
    return `No documents uploaded yet. Generate questions about "${topic}" based on general knowledge.`;
  }
  // Build context from document names + any text you've stored
  // If you store actual text content in your docs, use that here instead
  const docList = documents.map(d => `- ${d.name} (${d.chunks} chunks)`).join('\n');
  return `The student has uploaded these study documents:\n${docList}\n\nGenerate content specifically about: "${topic}"`;
}

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InnovGenius server is running!' });
});

// ── UPLOAD ────────────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const doc = {
    id: Date.now().toString(),
    name: req.file.originalname,
    type: ext,
    size: req.file.size,
    chunks: Math.floor(Math.random() * 40) + 10,
    uploadedAt: new Date().toISOString(),
    path: req.file.path,
  };

  documents.push(doc);
  statsData.documentsUploaded++;

  console.log('✅ File uploaded:', req.file.originalname);
  res.json({ success: true, filename: req.file.originalname, doc });
});

// ── DOCUMENTS LIST ────────────────────────────────────────────────────────────
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

// ── DELETE DOCUMENT ───────────────────────────────────────────────────────────
app.delete('/api/documents/:id', (req, res) => {
  const idx = documents.findIndex(d => d.id === req.params.id);
  if (idx !== -1) {
    try { fs.unlinkSync(documents[idx].path); } catch {}
    documents.splice(idx, 1);
    if (statsData.documentsUploaded > 0) statsData.documentsUploaded--;
  }
  res.json({ success: true });
});

// ── CHAT ──────────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    console.log('💬 User asked:', message);

    const keywords = message.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    keywords.forEach(k => topicsExplored.add(k));

    const docContext = documents.length > 0
      ? `The student has uploaded these documents: ${documents.map(d => d.name).join(', ')}. `
      : '';

    const prompt = `You are InnovGenius, a smart AI study assistant. ${docContext}Help students understand their course materials clearly and concisely. Student question: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    statsData.questionsAsked++;

    chatHistory.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
    chatHistory.push({ role: 'ai', content: reply, timestamp: new Date().toISOString() });

    const sources = documents.map(d => d.name);
    res.json({ success: true, reply, sources });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── CLEAR CHAT ────────────────────────────────────────────────────────────────
app.post('/api/chat/clear', (req, res) => {
  chatHistory = [];
  res.json({ success: true });
});

// ── TOPICS ────────────────────────────────────────────────────────────────────
app.get('/api/topics', (req, res) => {
  const topTopics = [...topicsExplored].slice(-8);
  res.json({ topics: topTopics });
});

// ── STATS (updated with new fields) ──────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  res.json({
    questionsAsked: statsData.questionsAsked,
    documentsUploaded: statsData.documentsUploaded,
    topicsExplored: topicsExplored.size,
    quizzesTaken: statsData.quizzesTaken,
    flashcardsStudied: statsData.flashcardsStudied,  // NEW
    voiceQueries: statsData.voiceQueries,            // NEW
  });
});

// ── QUIZ GENERATOR ────────────────────────────────────────────────────────────
app.post('/api/quiz/generate', async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;
  if (!topic) return res.status(400).json({ error: 'No topic provided' });

  try {
    console.log(`🧠 Generating ${numQuestions} quiz questions about: ${topic}`);

    const context = getChunksForTopic(topic);

    const prompt = `
You are a quiz generator for a study assistant app. Generate exactly ${numQuestions} multiple-choice questions about "${topic}".

${context}

Return a JSON array ONLY — no markdown, no extra text, no code fences. Use this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

Rules:
- "correct" is the 0-based index of the correct answer (0, 1, 2, or 3)
- Make all 4 options plausible but only one clearly correct
- Keep questions clear and educational
- Vary difficulty: some easy, some medium, some hard
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip markdown code fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    statsData.quizzesTaken++;
    console.log(`✅ Quiz generated: ${questions.length} questions`);

    res.json({ questions });
  } catch (error) {
    console.error('❌ Quiz generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate quiz', questions: [] });
  }
});

// ── FLASHCARD GENERATOR ───────────────────────────────────────────────────────
app.post('/api/flashcards/generate', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'No topic provided' });

  try {
    console.log(`🃏 Generating flashcards about: ${topic}`);

    const context = getChunksForTopic(topic);

    const prompt = `
You are a flashcard generator for a study assistant app. Create 8 flashcards about "${topic}".

${context}

Return a JSON array ONLY — no markdown, no extra text, no code fences. Use this exact format:
[
  {
    "front": "Question or concept name",
    "back": "Clear, concise explanation in 2-3 sentences."
  }
]

Rules:
- Front: a question, key term, or concept
- Back: a clear, concise answer or explanation
- Cover the most important concepts
- Keep backs short and easy to remember
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const clean = text.replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(clean);

    statsData.flashcardsStudied += flashcards.length;
    console.log(`✅ Flashcards generated: ${flashcards.length} cards`);

    res.json({ flashcards });
  } catch (error) {
    console.error('❌ Flashcard generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate flashcards', flashcards: [] });
  }
});

// ── HIGHLIGHT & ASK ───────────────────────────────────────────────────────────
app.post('/api/chat/highlight', async (req, res) => {
  const { selectedText, question } = req.body;
  if (!selectedText || !question) return res.status(400).json({ error: 'Missing selectedText or question' });

  try {
    console.log(`📌 Highlight & Ask: "${question}" about "${selectedText.slice(0, 60)}..."`);

    const docContext = documents.length > 0
      ? `The student has these documents: ${documents.map(d => d.name).join(', ')}.`
      : '';

    const prompt = `
You are InnovGenius, a smart AI study assistant. ${docContext}

The student highlighted this text:
"${selectedText}"

Their question about it: "${question}"

Answer clearly and concisely in 2-4 sentences. Be educational and helpful.
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    statsData.questionsAsked++;

    res.json({ reply, sources: documents.map(d => d.name) });
  } catch (error) {
    console.error('❌ Highlight ask error:', error.message);
    res.status(500).json({ error: 'Failed to process highlighted text' });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ InnovGenius running at http://localhost:${PORT}`);
});
