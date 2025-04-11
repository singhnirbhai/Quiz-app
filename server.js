const express = require('express');

const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;


const app = express();
const PORT = 3000;

// Serve static files like login.html, register.html, etc.

app.use(express.static('public'));
app.use(express.json());


// In-memory user list
const users = [
  { email: "admin@quiz.com", password: "admin123", role: "admin" },
  { email: "user@example.com", password: "user123", role: "student" }
];

const scores = [];
const questionFilePath = path.join(__dirname, 'data', 'questions.json');

// Helper: Load questions from JSON file
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

// Helper: Save questions to JSON file
function saveQuestions(questions) {
  fs.writeFileSync(questionFilePath, JSON.stringify(questions, null, 2));
}

// ✅ Register API
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "All fields are required." });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "User already registered." });
  }

  users.push({ email, password, role });
  console.log("👤 Registered:", email, "-", role);
  res.json({ success: true, message: "Registration successful!" });
});

// ✅ Login API

// Middleware to parse JSON
app.use(express.json());

// Single shared user list (in-memory)
const users = [
  { email: "admin@example.com", password: "admin123", role: "admin" },
  { email: "user@example.com", password: "user123", role: "student" }
];

// Login API

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
  const { email, score } = req.body;

  if (!email || typeof score !== 'number') {
    return res.json({ success: false, message: "Email and valid score are required." });
  }

  scores.push({ email, score });
  console.log("🎯 Score submitted:", email, "-", score);
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
    answer: options[correctIndex]  // ✅ store actual answer, not just index
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

// Register API
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "All fields are required." });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "User already registered." });
  }

  users.push({ email, password, role });
  res.json({ success: true, message: "Registration successful!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}/login.html`);

});




 
 
