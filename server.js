const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// In-memory user list (only admin hardcoded)
const users = [
  { email: "admin@quiz.com", password: "admin123", role: "admin" }
];

const scores = [];
const questionFilePath = path.join(__dirname, 'data', 'questions.json');

// Load questions from file
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

// Save questions to file
function saveQuestions(questions) {
  fs.writeFileSync(questionFilePath, JSON.stringify(questions, null, 2));
}

// ✅ Register API
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "User already registered." });
  }

  users.push({ email, password, role: "student" }); // Force role to student
  console.log("👤 Registered:", email);
  res.json({ success: true, message: "Registration successful!" });
});

// ✅ Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Submit quiz score (now includes wrong answers)
app.post('/api/submit-score', (req, res) => {
  const { email, score, wrongAnswers } = req.body;

  if (!email || typeof score !== 'number') {
    return res.json({ success: false, message: "Email and valid score are required." });
  }

  const entry = { email, score, wrongAnswers: wrongAnswers || [] };
  scores.push(entry);

  console.log("🎯 Score submitted:", email, "-", score);
  if (wrongAnswers && wrongAnswers.length > 0) {
    console.log("❌ Wrong Answers:\n", JSON.stringify(wrongAnswers, null, 2));
  }

  res.json({ success: true, message: "Score submitted successfully!" });
});

// ✅ Get all quiz scores
app.get('/api/scoreboard', (req, res) => {
  res.json(scores);
});

// ✅ Add question (admin only)
app.post('/api/admin/add-question', (req, res) => {
  const { subject, question, options, correctIndex } = req.body;

  if (
    !subject ||
    !question ||
    !Array.isArray(options) ||
    options.length < 2 ||
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
    answer: options[correctIndex]  // ✅ stored for backend validation or display
  };

  allQuestions.push(newQuestion);
  saveQuestions(allQuestions);

  console.log("📘 Question added:", subject, "-", question);
  res.json({ success: true, message: "Question added successfully!" });
});

// ✅ Get all questions
app.get('/api/questions', (req, res) => {
  const allQuestions = loadQuestions();
  res.json(allQuestions);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}/login.html`);
});
