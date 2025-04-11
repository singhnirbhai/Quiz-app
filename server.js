const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files like login.html, register.html, etc.
app.use(express.static('public'));

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
