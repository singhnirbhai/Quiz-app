const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// File functions
const loadData = (file) => JSON.parse(fs.readFileSync(`./data/${file}`));
const saveData = (file, data) => fs.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));
// Register
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;
  const users = loadData('users.json');

  if (users.some(u => u.email === email)) {
    return res.json({ success: false, message: "User already exists" });
  }

  users.push({ email, password, role });
  saveData('users.json', users);
  res.json({ success: true, message: "Registered successfully" });
});


// ✅ LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadData('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ GET QUESTIONS BY SUBJECT
app.get('/api/questions/:subject', (req, res) => {
  const subject = req.params.subject;
  const questions = loadData('questions.json').filter(q => q.subject === subject);
  res.json(questions);
});

// ✅ SUBMIT SCORE
app.post('/api/scores', (req, res) => {
  const scores = loadData('scores.json');
  scores.push(req.body);
  saveData('scores.json', scores);
  res.json({ success: true });
});

// ✅ GET SCORES (leaderboard)
app.get('/api/scores', (req, res) => {
  const scores = loadData('scores.json');
  res.json(scores);
});

// ✅ ADD QUESTION (admin only)
app.post('/api/admin/add-question', (req, res) => {
  const questions = loadData('questions.json');
  const newQuestion = { id: questions.length + 1, ...req.body };
  questions.push(newQuestion);
  saveData('questions.json', questions);
  res.json({ success: true });
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

