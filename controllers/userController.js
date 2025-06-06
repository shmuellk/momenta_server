const User = require("../models/userModel");
const bcrypt = require("bcrypt");
User.syncIndexes();

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ verified: true });
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

    const user = await User.findOne({ email, verified: true });

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

const getUsersComplit = async (req, res) => {
  try {
    const search = req.body.data;
    if (!search || search.trim() === "") {
      return res.status(200).send([]);
    }
    const users = await User.find({
      verified: true,
      userName: { $regex: search, $options: "i" },
    });

    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = { getAllUsers, deleteUser, loginUser, getUsersComplit };
