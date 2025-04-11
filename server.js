const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper functions
const loadData = (file) => {
  try {
    return JSON.parse(fs.readFileSync(`./data/${file}`));
  } catch {
    return [];
  }
};

const saveData = (file, data) => {
  fs.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));
};

// Register user
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;
  const users = loadData('users.json');

  if (!email || !password || password.length < 4) {
    return res.json({ success: false, message: "Email and password (min 4 chars) required" });
  }

  if (users.some(u => u.email === email)) {
    return res.json({ success: false, message: "User already exists" });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    email,
    password,
    role
  };

  users.push(newUser);
  saveData('users.json', users);
  res.json({ success: true, message: "Registered successfully" });
});

// Login user
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

// Get questions by subject
app.get('/api/questions/:subject', (req, res) => {
  const subject = req.params.subject;
  const questions = loadData('questions.json').filter(q => q.subject === subject);
  res.json(questions);
});

// Submit score
app.post('/api/scores', (req, res) => {
  const scores = loadData('scores.json');
  scores.push(req.body);
  saveData('scores.json', scores);
  res.json({ success: true });
});

// Get all scores
app.get('/api/scores', (req, res) => {
  const scores = loadData('scores.json');
  res.json(scores);
});

// Admin adds new question
app.post('/api/admin/add-question', (req, res) => {
  const questions = loadData('questions.json');
  const newQuestion = {
    id: questions.length + 1,
    ...req.body
  };
  questions.push(newQuestion);
  saveData('questions.json', questions);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
