const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

// Security Middleware
app.use(helmet());
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// In-memory users array (Replace with DB in production)
let users = [];

// Middleware to authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = decoded;
    next();
  });
};

// Register User
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, name, email, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully!' });
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Get All Users (Excluding Passwords)
app.get('/users', authenticateToken, (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  res.status(200).json(usersWithoutPasswords);
});

// Update User
app.put('/users/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  const { name, email, password } = req.body;
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: `User with ID ${userId} not found.` });
  }

  if (email && email !== user.email) {
    if (users.some((u) => u.email === email && u.id !== userId)) {
      return res.status(400).json({ message: 'Email already in use by another user.' });
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = await bcrypt.hash(password, 10);

  res.status(200).json({ message: `User with ID ${userId} updated successfully.`, user });
});

// Delete User
app.delete('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });

  const authenticatedUserId = req.user.id;
  if (userId !== authenticatedUserId) {
    return res.status(403).json({ message: 'You are not authorized to delete this user.' });
  }

  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: `User with ID ${userId} not found.` });
  }

  users.splice(userIndex, 1);
  res.status(200).json({ message: `User with ID ${userId} deleted successfully.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
