// controllers/postController.js
const path = require("path");
const Post = require("../models/postModel");

// ----- יצירת פוסט חדש -----
exports.createPost = async (req, res) => {
  try {
    // 1. ודא שהגיע קובץ
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded. Field name must be 'photo'." });
    }

    // 2. קבל את userId ו־text מתוך ה־body
    const { userId, text } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required in body." });
    }

    // 3. בנה את imageUrl
    const host = req.get("host");
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // 4. שמור למסד
    const post = await Post.create({
      imageUrl,
      text: text || "", // אם אין text, יהיה מחרוזת ריקה
      userId,
      likes: 0,
      comments: [],
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error("Error in createPost controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- קבלת כל הפוסטים (למשל דף הבית) -----
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .populate("comments.userId", "username");
    return res.json(posts);
  } catch (err) {
    console.error("Error in getAllPosts controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- קבלת פוסט לפי ID -----
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("userId", "username")
      .populate("comments.userId", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json(post);
  } catch (err) {
    console.error("Error in getPostById controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- הוספת תגובה (comment) לפוסט -----
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;
    if (!userId || !text) {
      return res
        .status(400)
        .json({ error: "userId and text are required in body." });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = { userId, text, createdAt: Date.now() };
    post.comments.push(newComment);
    await post.save();

    const populated = await Post.findById(id)
      .populate("userId", "username")
      .populate("comments.userId", "username");
    return res.json(populated);
  } catch (err) {
    console.error("Error in addComment controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- מתן לייק לפוסט -----
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes += 1;
    await post.save();

    return res.json({ likes: post.likes });
  } catch (err) {
    console.error("Error in likePost controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- מחיקת פוסט (אופציונלי) -----
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ message: "Post deleted", postId: id });
  } catch (err) {
    console.error("Error in deletePost controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
