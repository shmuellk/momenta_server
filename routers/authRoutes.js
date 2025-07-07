const express = require("express");
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");

const router = express.Router();

// 📦 הגדרת אחסון Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profile-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// 📌 הגבלת סוגי קבצים מותרים
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG/PNG images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // עד 5MB
  },
});

// 🛡 עטיפת Multer לטיפול בשגיאות העלאה
const uploadWithErrorHandling = (req, res, next) => {
  upload.single("imageProfile")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // שגיאה של multer (כמו גודל קובץ)
      return res.status(400).json({ error: `שגיאת העלאה: ${err.message}` });
    } else if (err) {
      // שגיאה כללית (סוג קובץ לא תקין וכו')
      return res.status(400).json({ error: err.message });
    }
    next(); // הצלחה
  });
};

// 📥 רישום משתמש ושליחת קוד אימות
router.post("/register", uploadWithErrorHandling, async (req, res) => {
  try {
    await authController.sendVerificationCode(req, res);
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "שגיאה פנימית ברישום משתמש." });
  }
});

// 🔁 שליחת קוד אימות מחדש
router.post("/resend", async (req, res) => {
  try {
    await authController.resendPinCode(req, res);
  } catch (err) {
    console.error("resend error:", err);
    res.status(500).json({ error: "שגיאה בשליחה מחדש של הקוד." });
  }
});

// ✅ אימות קוד
router.post("/verify", async (req, res) => {
  try {
    await authController.verifyUser(req, res);
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ error: "שגיאה באימות הקוד." });
  }
});

module.exports = router;
