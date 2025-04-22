const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// In-memory users (admin + students)
const users = [
  { email: "admin@quiz.com", password: "admin123", role: "admin" }
];

const scores = [];
const questionFilePath = path.join(__dirname, 'data', 'questions.json');

// Load questions
function loadQuestions() {
  try {
    if (!fs.existsSync(questionFilePath)) return [];
    const content = fs.readFileSync(questionFilePath, 'utf-8');
    return content ? JSON.parse(content) : [];
  } catch (err) {
    console.error("❌ Failed to load questions:", err);
    return [];
  }
}

// Save questions
function saveQuestions(questions) {
  fs.writeFileSync(questionFilePath, JSON.stringify(questions, null, 2));
}

// ✅ Register student
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "User already registered." });
  }

  users.push({ email, password, role: "student" });
  console.log("👤 Registered:", email);
  res.json({ success: true, message: "Registration successful!" });
});

// ✅ Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Submit quiz score
app.post('/api/submit-score', (req, res) => {
  const { email, score, subject, total, time, wrongAnswers } = req.body;

  if (!email || typeof score !== 'number') {
    return res.json({ success: false, message: "Email and valid score are required." });
  }

  const entry = { email, score, subject, total, time, wrongAnswers: wrongAnswers || [] };
  scores.push(entry);

  res.json({ success: true, message: "Score submitted!", redirect: "/leaderboard.html" });
});

// ✅ Leaderboard data
app.get('/api/scoreboard', (req, res) => {
  res.json(scores);
});

// ✅ Add question (admin only)
app.post('/api/admin/add-question', (req, res) => {
  const { subject, question, options, correctIndex } = req.body;

  if (
    !subject || !question ||
    !Array.isArray(options) || options.length < 2 ||
    typeof correctIndex !== 'number'
  ) {
    return res.status(400).json({ success: false, message: "Invalid question data." });
  }

  const allQuestions = loadQuestions();
  const newQuestion = {
    subject,
    question,
    options,
    correctIndex,
    answer: options[correctIndex]
  };

  allQuestions.push(newQuestion);
  saveQuestions(allQuestions);

  console.log("📘 Question added:", subject, "-", question);
  res.json({ success: true, message: "Question added!" });
});

// ✅ Get all questions
app.get('/api/questions', (req, res) => {
  const { subject } = req.query; // Get subject query parameter
  const allQuestions = loadQuestions();

  if (subject) {
    // Filter questions by subject if provided
    const filteredQuestions = allQuestions.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    res.json(filteredQuestions);
  } else {
    // Return all questions if no subject specified
    res.json(allQuestions);
  }
});

// ✅ Get all subjects
app.get('/api/subjects', (req, res) => {
  const allQuestions = loadQuestions();
  const subjects = [...new Set(allQuestions.map(q => q.subject))]; // Extract unique subjects
  res.json(subjects);
});

// ✅ Serve leaderboard.html directly
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}/login.html`);
});
