// controllers/postController.js
const path = require("path");
const Post = require("../models/postModel");

// ----- יצירת פוסט חדש -----
const createPost = async (req, res) => {
  console.log("📥 req.file:", req.file);
  console.log("📥 req.body:", req.body);
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
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // דף נוכחי
    const limit = parseInt(req.query.limit) || 5; // כמה פוסטים בכל בקשה
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username")
      .populate("comments.userId", "username");

    const totalCount = await Post.countDocuments();

    return res.json({ posts, totalCount });
  } catch (err) {
    console.error("Error in getAllPosts controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- קבלת פוסט לפי ID -----
const getPostById = async (req, res) => {
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

const getPostsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// ----- הוספת תגובה (comment) לפוסט -----
const addComment = async (req, res) => {
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
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // <-- חובה לשלוח userId מהקליינט

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // אם כבר עשה לייק — מסירים
      post.likedBy.pull(userId);
      post.likes -= 1;
    } else {
      // אחרת מוסיפים
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    return res.json({ likes: post.likes, likedBy: post.likedBy });
  } catch (err) {
    console.error("Error in likePost controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----- מחיקת פוסט (אופציונלי) -----
const deletePost = async (req, res) => {
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

module.exports = {
  createPost,
  getAllPosts,
  deletePost,
  likePost,
  addComment,
  getPostById,
  getPostsByUserId,
};
