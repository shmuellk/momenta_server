// models/Post.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// תת־סכמה לתגובה
const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// סכמה עיקרית לפוסט
const PostSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  text: {
    type: String, // <-- הוספנו שדה text
    trim: true,
    default: "",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
