const User = require('../models/user'); // Make sure this path is correct
const bcrypt = require('bcrypt');

// Register handler
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existing = await User.findOne({ email, role });

    if (existing) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
    await newUser.save();

    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.json({ success: false, message: "Email doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, message: 'Login successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
