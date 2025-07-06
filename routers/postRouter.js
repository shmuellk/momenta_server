// routes/posts.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const postController = require("../controllers/postController");

const router = express.Router();

// הגדרת storage של multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// CREATE POST
//  במבנה FormData, יש לשלוח:
//  • photo (file)
//  • userId (string של ObjectId)
//  • text (string של הטקסט לפוסט)
router.post("/", upload.single("photo"), postController.createPost);

// GET ALL POSTS
router.get("/", postController.getAllPosts);

// GET SINGLE POST
router.get("/:id", postController.getPostById);
router.get("/user/:id", postController.getPostsByUserId);

// ADD COMMENT TO POST
router.post("/:id/comments", express.json(), postController.addComment);

// LIKE A POST
router.post("/:id/like", postController.likePost);

// DELETE POST (אופציונלי)
router.delete("/:id", postController.deletePost);

module.exports = router;
