// controllers/userController.js

const User = require("../models/userModel");
const path = require("path");
const bcrypt = require("bcrypt");

// סנכרון אינדקסים
User.syncIndexes();

// --- שליפת כל המשתמשים ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ verified: true });
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// --- מחיקת משתמש ---
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

// --- התחברות משתמש ---
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

// --- אוטו-קומפליט לשמות משתמש ---
const getUsersComplete = async (req, res) => {
  try {
    const search = req.body.searchText;
    console.log(search);

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

// --- שליפת משתמש לפי ID ---
const getUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User found successfully", user });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// --- עדכון פרטי משתמש ---
const updateUser = async (req, res) => {
  try {
    const { userId, name, userName, email, phone, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (userName !== undefined) user.userName = userName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- עדכון תמונת פרופיל ---
const updateProfileImage = async (userId, imageUri) => {
  try {
    if (!imageUri) {
      return { ok: false, error: "No image URI provided." };
    }

    const formData = new FormData();
    formData.append("userId", userId);

    const filename = imageUri.split("/").pop();
    const extMatch = /\.(\w+)$/.exec(filename || "");
    const mimeType = extMatch ? `image/${extMatch[1]}` : "image/jpeg";

    formData.append("profileImage", {
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
      name: filename,
      type: mimeType,
    });

    const response = await axios.post(
      `http://${ip}/users/updateProfileImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { ok: true, data: response.data.user };
  } catch (error) {
    console.log("updateProfileImage error:", error.message);
    return {
      ok: false,
      error:
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error occurred.",
    };
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  loginUser,
  getUsersComplete,
  updateUser,
  updateProfileImage,
};
