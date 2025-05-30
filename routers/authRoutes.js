// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// שליחת קוד אימות
router.post("/register", authController.sendVerificationCode);

// שליחת קוד חדש
router.post("/resend", authController.resendPinCode);

// אימות הקוד
router.post("/verify", authController.verifyUser);

module.exports = router;
