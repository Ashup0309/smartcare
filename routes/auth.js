const express = require('express');
const router = express.Router();
const User = require('../models/user');

// ✅ Register Route
router.post('/register', async (req, res) => {
  try {
    // Normalize role before saving
    req.body.role = req.body.role?.trim().toLowerCase();
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, message: 'User registered' });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please login instead.'
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Login Route (updated)
router.post('/login', async (req, res) => {
  let { email, password, role } = req.body;

  // Normalize input
  email = email?.trim().toLowerCase();
  role = role?.trim().toLowerCase();

  console.log('🔐 Login request received:', { email, role });

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ success: false, message: 'Email does not exist.' });
    }

    const userRole = String(user.role || '').trim().toLowerCase();
    if (userRole !== role) {
      console.log(`❌ Role mismatch. Found: ${user.role}, Expected: ${role}`);
      return res.status(400).json({
        success: false,
        message: `This email is not registered as a ${role.charAt(0).toUpperCase() + role.slice(1)}.`
      });
    }

    if (user.password !== password) {
      console.log('❌ Incorrect password');
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    console.log('✅ Login successful');
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user
    });

  } catch (err) {
    console.error('🔥 Login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: err.message
    });
  }
});

module.exports = router;
