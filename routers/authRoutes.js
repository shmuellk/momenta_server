// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    // e.g. “profile-<timestamp>.<ext>”
    const ext = path.extname(file.originalname);
    const name = "profile-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

// שליחת קוד אימות
router.post(
  "/register",
  upload.single("imageProfile"),
  authController.sendVerificationCode
);

// שליחת קוד חדש
router.post("/resend", authController.resendPinCode);

// אימות הקוד
router.post("/verify", authController.verifyUser);

module.exports = router;
