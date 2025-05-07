const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();


const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET ;

// Email format regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;


  // Basic field validation
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET, // <- make sure this is defined
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully!',
      token,
      user_id: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ error: 'User not found!' });


    // Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials!' });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn:'1h' }
    );

    // Send token and success message
    res.status(200).json({ token, message: 'Login successful!', user_id: user._id });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Protected Route Example
router.get('/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Access granted!', user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Token!' });
  }
});

module.exports = router;
