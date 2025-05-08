const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const { name, email, password, userName, phone } = req.body;

    // בודקים אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // מצפינים את הסיסמה
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      phone,
      userName,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser, getAllUsers, deleteUser, loginUser };
